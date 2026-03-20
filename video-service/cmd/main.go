package main

import (
	"log"
	"movie-api/video-service/internal/handlers"
	"net/http"
)

func main() {
	http.HandleFunc("/upload", handlers.UploadVideo)

	// Статика для просмотра видео
	fs := http.FileServer(http.Dir("./uploads"))
	http.Handle("/uploads/", http.StripPrefix("/uploads/", fs))

	log.Println("Video Service running at :8081")
	http.ListenAndServe(":8081", nil)
}