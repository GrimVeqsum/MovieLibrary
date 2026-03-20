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

func main() {
	dsn := os.Getenv("DSN")
	if dsn == "" {
		dsn = "host=postgres user=postgres password=postgres dbname=movieDB port=5432 sslmode=disable"
	}

	var db *gorm.DB
	var err error

	// Ждём пока Postgres будет готов
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

	// Миграция таблиц
	if err := models.Migrate(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	movieHandler := &handlers.MovieHandler{DB: db}

	// Маршруты
	r := mux.NewRouter()
	r.HandleFunc("/movies", movieHandler.CreateMovie).Methods("POST")
	r.HandleFunc("/movies", movieHandler.GetMovies).Methods("GET")
	r.HandleFunc("/movies/{id}", movieHandler.GetMovie).Methods("GET")
	r.HandleFunc("/movies/{id}", movieHandler.UpdateMovie).Methods("PUT")
	r.HandleFunc("/movies/{id}", movieHandler.DeleteMovie).Methods("DELETE")

	log.Println("Movie Service running at :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}