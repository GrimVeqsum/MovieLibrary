package main

import (
	"log"
	"movie-api/movie-service/internal/handlers"
	"movie-api/movie-service/internal/models"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	dsn := os.Getenv("DSN")
	if dsn == "" {
		dsn = "host=postgres user=postgres password=postgres dbname=movieDB port=5432 sslmode=disable"
	}

	var db *gorm.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Println("Postgres not ready, retrying in 3s...")
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := models.Migrate(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	movieHandler := &handlers.MovieHandler{DB: db}

	r := mux.NewRouter()
	r.Use(corsMiddleware)

	r.HandleFunc("/movies", movieHandler.CreateMovie).Methods("POST", "OPTIONS")
	r.HandleFunc("/movies", movieHandler.GetMovies).Methods("GET", "OPTIONS")
	r.HandleFunc("/movies/{id}", movieHandler.GetMovie).Methods("GET", "OPTIONS")
	r.HandleFunc("/movies/{id}", movieHandler.UpdateMovie).Methods("PUT", "OPTIONS")
	r.HandleFunc("/movies/{id}", movieHandler.DeleteMovie).Methods("DELETE", "OPTIONS")

	log.Println("Movie Service running at :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}