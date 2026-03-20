package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func UploadVideo(w http.ResponseWriter, r *http.Request) {
	movieID := r.URL.Query().Get("movie_id")
	if movieID == "" {
		http.Error(w, "movie_id required", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")
	bucket := os.Getenv("MINIO_BUCKET")

	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// создаём бакет, если не существует
	exists, err := minioClient.BucketExists(r.Context(), bucket)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !exists {
		if err := minioClient.MakeBucket(r.Context(), bucket, minio.MakeBucketOptions{}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	objectName := fmt.Sprintf("%s_%d_%s", movieID, time.Now().Unix(), header.Filename)
	info, err := minioClient.PutObject(r.Context(), bucket, objectName, file, header.Size, minio.PutObjectOptions{
		ContentType: header.Header.Get("Content-Type"),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	videoURL := fmt.Sprintf("http://localhost:9000/%s/%s", bucket, info.Key)
	w.Write([]byte(videoURL))
}