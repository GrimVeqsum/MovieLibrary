package handlers

import (
	"encoding/json"
	"movie-api/movie-service/internal/models"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type MovieHandler struct {
	DB *gorm.DB
}

// CREATE
func (h *MovieHandler) CreateMovie(w http.ResponseWriter, r *http.Request) {
	var movie models.Movie
	if err := json.NewDecoder(r.Body).Decode(&movie); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.DB.Create(&movie)
	json.NewEncoder(w).Encode(movie)
}

// READ ALL
func (h *MovieHandler) GetMovies(w http.ResponseWriter, r *http.Request) {
	var movies []models.Movie
	h.DB.Find(&movies)
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
	h.DB.Model(&movie).Updates(input)
	json.NewEncoder(w).Encode(movie)
}

// DELETE
func (h *MovieHandler) DeleteMovie(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	h.DB.Delete(&models.Movie{}, id)
	w.WriteHeader(http.StatusNoContent)
}

// UPDATE VideoURL
func (h *MovieHandler) UpdateVideoURL(id string, url string) error {
	var movie models.Movie
	if err := h.DB.First(&movie, id).Error; err != nil {
		return err
	}
	h.DB.Model(&movie).Update("VideoURL", url)
	return nil
}