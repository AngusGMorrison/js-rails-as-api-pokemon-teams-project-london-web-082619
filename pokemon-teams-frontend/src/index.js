const baseUrl = "http://localhost:3000";
const trainersUrl = `${baseUrl}/trainers`;
const pokemonsUrl = `${baseUrl}/pokemons`;


var module = (function() {

  const DOM = {}

  /*============== private methods ===============*/

  function cacheDom() {
    DOM.main = document.querySelector("main");
  }

  function getTeams() {
    fetch(trainersUrl)
      .then(response => response.json())
      .then(json => renderTeams(json))
      .catch(console.log);
  }

  function renderTeams(json) {
    json.data.forEach(trainer => {
      const card = renderTrainer(trainer);
      const pokemons = renderPokemons(trainer.relationships, json.included);
      card.appendChild(pokemons)
      DOM.main.appendChild(card);
    });
  }

  function renderTrainer(trainer) {
    const card = createTrainerCard(trainer.id);
    card.appendChild(createTrainerHeading(trainer.attributes.name));
    card.appendChild(createAddPokemonButton(trainer.id));
    return card;
  }

  function createTrainerCard(trainerId) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-id", `${trainerId}`);
    return card
  }

  function createTrainerHeading(trainerName) {
    const heading = document.createElement("p");
    heading.textContent = trainerName;
    return heading;
  }

  function createAddPokemonButton(trainerId) {
    const button = document.createElement("button");
    button.setAttribute("data-trainer-id", `${trainerId}`);
    button.textContent = "Add Pokemon";
    button.addEventListener("click", createNewPokemon);
    return button;
  }

  function createNewPokemon(event) {
    const currentTeam = event.target.nextSibling.children;
    if (!teamIsFull(currentTeam)) {
      const trainerId = event.target.dataset.trainerId;
      const requestConfig = createNewPokemonRequestConfig(trainerId);
      const pokemonListItem = fetch(pokemonsUrl, requestConfig)
        .then(response => response.json())
        .then(json => renderNewPokemon(json.data, trainerId))
        .catch(console.log);
    }
  }

  function teamIsFull(team) {
    return team.length >= 6;
  }

  function renderNewPokemon(pokemon, trainerId) {
    const pokemonListItem = createPokemonListItem(pokemon);
    const pokemonTeam = document.querySelector(`div[data-id="${trainerId}"] ul`);
    pokemonTeam.appendChild(pokemonListItem);
  }

  function createNewPokemonRequestConfig(trainerId) {
    const config = createBaseRequestConfig("POST");
    config.body = JSON.stringify({ trainer_id: trainerId });
    return config;
  }

  function renderPokemons(trainerRelationships, allPokemons) {
    const teamIds = getTeamIds(trainerRelationships.pokemons);
    const pokemons = getTeamPokemons(teamIds, allPokemons);
    const ul = createPokemonList(pokemons);
    return ul;
  }

  function getTeamIds(pokemonRelationships) {
    return pokemonRelationships.data.map(pokemon => {
      return pokemon.id;
    });
  }

  function getTeamPokemons(teamIds, allPokemons) {
    return allPokemons.filter(pokemon => {
      return teamIds.includes(pokemon.id);
    });
  }

  function createPokemonList(pokemons) {
    const ul = document.createElement("ul");

    pokemons.forEach(pokemon =>{
      const li = createPokemonListItem(pokemon);
      ul.appendChild(li);
    });

    return ul;
  }

  function createPokemonListItem(pokemon) {
    const li = document.createElement("li");
    const releaseButton = createReleasePokemonButton(pokemon.attributes.id);
    li.setAttribute("data-pokemon-id", pokemon.attributes.id)
    li.textContent = `${pokemon.attributes.nickname} (${pokemon.attributes.species})`
    li.appendChild(releaseButton);

    return li;
  }

  function createReleasePokemonButton(pokemonId) {
    const button = document.createElement("button");
    button.classList.add("release");
    button.setAttribute("data-pokemon-id", pokemonId);
    button.textContent = "Release";
    button.addEventListener("click", releasePokemon);

    return button;
  }

  function releasePokemon(event) {
    const pokemonId = event.target.dataset.pokemonId;
    const requestConfig = createBaseRequestConfig("DELETE");
    fetch(`${pokemonsUrl}/${pokemonId}`, requestConfig)
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP response code" + response.status);
        }
        event.target.parentNode.remove();
      })
      .catch(console.log);
  }

  function createBaseRequestConfig(method) {
    return {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    }
  }

  /*============= public methods ==============*/

  function init() {
    cacheDom();
    getTeams();
  }

  /*============= return interface =============*/

  return {
    init: init
  }

}());

module.init();
