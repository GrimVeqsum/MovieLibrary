package main

import (
	"log"
	"movie-api/video-service/internal/handlers"
	"net/http"
)

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Range")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /upload", handlers.UploadVideo)
	mux.HandleFunc("GET /video/{objectName}", handlers.GetVideo)

	log.Println("Video Service running at :8081")
	if err := http.ListenAndServe(":8081", withCORS(mux)); err != nil {
		log.Fatal(err)
	}
}