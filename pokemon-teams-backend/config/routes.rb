Rails.application.routes.draw do
  root "trainers#index"
  resources :trainers, only: [:index]
  resources :pokemons, only: [:create, :destroy]
end
