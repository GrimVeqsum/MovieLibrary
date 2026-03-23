package handlers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func newMinioClient() (*minio.Client, string, error) {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")
	bucket := os.Getenv("MINIO_BUCKET")

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false,
	})
	if err != nil {
		return nil, "", err
	}

	return client, bucket, nil
}

func ensureBucket(ctx context.Context, client *minio.Client, bucket string) error {
	exists, err := client.BucketExists(ctx, bucket)
	if err != nil {
		return err
	}

	if !exists {
		return client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
	}

	return nil
}

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

	client, bucket, err := newMinioClient()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ctx := r.Context()

	if err := ensureBucket(ctx, client, bucket); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	objectName := fmt.Sprintf("%s_%d_%s", movieID, time.Now().Unix(), header.Filename)

	_, err = client.PutObject(
		ctx,
		bucket,
		objectName,
		file,
		header.Size,
		minio.PutObjectOptions{
			ContentType: header.Header.Get("Content-Type"),
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	videoURL := fmt.Sprintf("http://localhost:8081/video/%s", objectName)
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(videoURL))
}

func GetVideo(w http.ResponseWriter, r *http.Request) {
	objectName := r.PathValue("objectName")
	if objectName == "" {
		http.Error(w, "objectName required", http.StatusBadRequest)
		return
	}

	client, bucket, err := newMinioClient()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ctx := r.Context()

	obj, err := client.GetObject(ctx, bucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer obj.Close()

	info, err := obj.Stat()
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if info.ContentType != "" {
		w.Header().Set("Content-Type", info.ContentType)
	} else {
		w.Header().Set("Content-Type", "video/mp4")
	}

	w.Header().Set("Content-Length", fmt.Sprintf("%d", info.Size))
	w.Header().Set("Accept-Ranges", "bytes")

	http.ServeContent(w, r, info.Key, info.LastModified, obj)
}

func DeleteVideo(w http.ResponseWriter, r *http.Request) {
	objectName := r.PathValue("objectName")
	if objectName == "" {
		http.Error(w, "objectName required", http.StatusBadRequest)
		return
	}

	client, bucket, err := newMinioClient()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ctx := r.Context()

	err = client.RemoveObject(ctx, bucket, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, statErr := client.StatObject(ctx, bucket, objectName, minio.StatObjectOptions{})
	if statErr == nil {
		http.Error(w, "video still exists after delete", http.StatusInternalServerError)
		return
	}

	var objectError minio.ErrorResponse
	if errors.As(statErr, &objectError) && objectError.StatusCode != http.StatusNotFound {
		http.Error(w, statErr.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}