class PokemonsController < ApplicationController

  def create
    pokemon = Pokemon.create(
                trainer_id: params[:trainer_id],
                nickname: Faker::Name.name,
                species: Faker::Games::Pokemon.name)
    render json: PokemonSerializer.new(pokemon)
  end

  def destroy
    pokemon = Pokemon.find(params[:id])
    pokemon.destroy
  end

end
