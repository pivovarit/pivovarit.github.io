package pivovarit_github_io

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type MovieRentalService struct {
	rentalRepository interface {
		saveRentedMovie(userID, movieId string) error
		saveReturnedMovie(userID, movieId string) error
	}

	movieDescriptionsRepository interface {
		getMovieDescription(movieId string) (string, error)
	}
	movieRepository interface {
		getMovie(movieId string) (string, error)
	}
}

func (s MovieRentalService) Rent(userID, movieID string) error {
	movie, err := s.movieRepository.getMovie(movieID)
	if err != nil {
		return err
	}
	log.Printf("Movie %s rented by user %s", movie, userID)
	err = s.rentalRepository.saveRentedMovie(userID, movieID)
	if err != nil {
		return err
	}
	return nil
}

type PostgresMovieRepository struct {
	db *sql.DB
}

func (r PostgresMovieRepository) getMovie(movieId string) (string, error) {
	query := "SELECT title FROM movies WHERE id = $1"
	var title string
	err := r.db.QueryRow(query, movieId).Scan(&title)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("movie with id %s not found", movieId)
		}
		return "", err
	}
	return title, nil
}

type PostgresRentalRepository struct {
	db *sql.DB
}

func (r PostgresRentalRepository) saveRentedMovie(userID, movieId string) error {
	query := "INSERT INTO rentals (user_id, movie_id, rented_at) VALUES ($1, $2, NOW())"
	_, err := r.db.Exec(query, userID, movieId)
	return err
}

func (r PostgresRentalRepository) saveReturnedMovie(userID, movieId string) error {
	query := "UPDATE rentals SET returned_at = NOW() WHERE user_id = $1 AND movie_id = $2 AND returned_at IS NULL"
	result, err := r.db.Exec(query, userID, movieId)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("no active rental found for user %s and movie %s", userID, movieId)
	}
	return nil
}

type RESTMovieDescriptionsRepository struct {
	apiBaseURL string
	client     *http.Client
}

func (r RESTMovieDescriptionsRepository) getMovieDescription(movieId string) (string, error) {
	url := fmt.Sprintf("%s/movies/%s/description", r.apiBaseURL, movieId)
	resp, err := r.client.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch description: %s", resp.Status)
	}

	var result struct {
		Description string `json:"description"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.Description, nil
}

func main() {
	// Set up Postgres connection
	db, err := sql.Open("postgres", "postgresql://user:password@localhost/moviesdb?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	rentalRepository := PostgresRentalRepository{db}
	descriptionsRepository := RESTMovieDescriptionsRepository{
		"https://api.example.com",
		&http.Client{}}
	movieRepository := PostgresMovieRepository{db}

	movieRentalService := MovieRentalService{
		rentalRepository,
		descriptionsRepository,
		movieRepository}
}
