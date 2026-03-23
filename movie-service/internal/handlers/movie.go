package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"movie-api/movie-service/internal/models"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type MovieHandler struct {
	DB              *gorm.DB
	VideoServiceURL string
	HTTPClient      *http.Client
}

// CREATE
func (h *MovieHandler) CreateMovie(w http.ResponseWriter, r *http.Request) {
	var movie models.Movie
	if err := json.NewDecoder(r.Body).Decode(&movie); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.DB.Create(&movie).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(movie)
}

// READ ALL
func (h *MovieHandler) GetMovies(w http.ResponseWriter, r *http.Request) {
	var movies []models.Movie
	if err := h.DB.Find(&movies).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(movies)
}

// READ ONE
func (h *MovieHandler) GetMovie(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var movie models.Movie
	if err := h.DB.First(&movie, id).Error; err != nil {
		http.Error(w, "Movie not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(movie)
}

// UPDATE
func (h *MovieHandler) UpdateMovie(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var movie models.Movie
	if err := h.DB.First(&movie, id).Error; err != nil {
		http.Error(w, "Movie not found", http.StatusNotFound)
		return
	}
	var input models.Movie
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.DB.Model(&movie).Updates(input).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := h.DB.First(&movie, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(movie)
}

// DELETE
func (h *MovieHandler) DeleteMovie(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var movie models.Movie
	if err := h.DB.First(&movie, id).Error; err != nil {
		http.Error(w, "Movie not found", http.StatusNotFound)
		return
	}

	if movie.VideoURL != "" {
		if err := h.deleteVideoObject(movie.VideoURL); err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
	}

	if err := h.DB.Delete(&movie).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UPDATE VideoURL
func (h *MovieHandler) UpdateVideoURL(id string, videoURL string) error {
	var movie models.Movie
	if err := h.DB.First(&movie, id).Error; err != nil {
		return err
	}
	return h.DB.Model(&movie).Update("video_url", videoURL).Error
}

func (h *MovieHandler) deleteVideoObject(videoURL string) error {
	if h.HTTPClient == nil {
		h.HTTPClient = http.DefaultClient
	}

	parsedURL, err := url.Parse(videoURL)
	if err != nil {
		return fmt.Errorf("invalid video url: %w", err)
	}

	objectName := path.Base(parsedURL.Path)
	if objectName == "." || objectName == "/" || objectName == "" {
		return fmt.Errorf("video object name is empty")
	}

	baseURL := strings.TrimRight(h.VideoServiceURL, "/")
	requestURL := fmt.Sprintf("%s/video/%s", baseURL, url.PathEscape(objectName))

	request, err := http.NewRequest(http.MethodDelete, requestURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create delete request: %w", err)
	}

	response, err := h.HTTPClient.Do(request)
	if err != nil {
		return fmt.Errorf("failed to delete video from storage: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusNoContent && response.StatusCode != http.StatusNotFound {
		body, _ := io.ReadAll(response.Body)
		return fmt.Errorf("video-service delete failed: %s", strings.TrimSpace(string(body)))
	}

	return nil
}