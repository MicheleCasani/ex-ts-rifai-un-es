
// Definisco i tipo di dati che mi aspetto dalle API
type Destinations = {
  activities: string[],
  best_time_to_visit: string,
  continent: string,
  country: string,
  currency: string,
  description: string,
  id: number,
  image: string,
  language: string,
  local_dishes: string[],
  name: string,
  population: string,
  top_attractions: string[]
}

type Weathers = {
  id: number,
  name: string,
  temperature: number,
  weather_description: string,
  humidity: number,
  wind_speed: number,
  pressure: number,
  visibility: number
}

type Airports = {
  id: number,
  name: string,
  iata_code: string,
  icao_code: string,
  location: {
    city: string,
    country: string,
    latitude: number,
    longitude: number
  },
  timezone: string,
  terminals: number
}

// Tipo per i dati aggregati che voglio restituire nella funzione getDashboardData

type DashboardData = {
  city: string | null,
  country: string | null,
  temperature: number | null,
  weather: string | null,
  airport: string | null
}

// Funzione per effettuare una richiesta HTTP e restituire il JSON come oggetto JavaScript
async function fetchJson<T>(url: string): Promise<T> {
  // Effettua una richiesta HTTP alla URL specificata
  const response = await fetch(url);
  // Converte la risposta in formato JSON
  const obj = await response.json();
  // Restituisce l'oggetto JavaScript ottenuto dal JSON
  return obj;
}


const getDashboardData = async (query: string): Promise<DashboardData> => {
  try {
    //Creo le 3 Promise (ma NON le eseguo ancora)
    // Ogni chiamata restituisce una Promise che "promette" di fare una richiesta HTTP
    const cityPromise = fetchJson<Destinations[]>(`http://localhost:3333/destinations?search=${query}`);
    const weatherPromise = fetchJson<Weathers[]>(`http://localhost:3333/weathers?search=${query}`);
    const airportPromise = fetchJson<Airports[]>(`http://localhost:3333/airports?search=${query}`);

    // Raggruppo tutte le Promise in un array
    const promises = [cityPromise, weatherPromise, airportPromise];

    //FASE 3: Promise.all() esegue TUTTE le chiamate IN PARALLELO
    // Aspetta che TUTTE finiscano prima di continuare
    // data = [ [destinations], [weathers], [airports] ] - array di 3 array
    const data = await Promise.all(promises) as [Destinations[], Weathers[], Airports[]];

    console.log('Dati aggregati:', data);  // Mostra i dati grezzi dalle API

    // Elaboro i dati grezzi e creo un oggetto pulito
    // Controllo se ogni array ha risultati (length > 0) prima di accedere ai dati
    return {
      city: data[0].length > 0 ? data[0][0].name : null,  // Primo risultato destinations o null
      country: data[0].length > 0 ? data[0][0].country : null,  // Paese della città o null
      temperature: data[1].length > 0 ? data[1][0].temperature : null,  // Temperatura o null
      weather: data[1].length > 0 ? data[1][0].weather_description : null,  // Descrizione meteo o null
      airport: data[2].length > 0 ? data[2][0].name : null  // Nome aeroporto o null
    }
  }
  catch (error) {
    // Se qualsiasi Promise fallisce, Promise.all() fallisce tutto
    console.error('Errore nel recuperare i dati:', error);
    throw new Error('Errore nel recuperare i dati');
  }

}

//   Chiamo la funzione con 'london' come parametro
getDashboardData('london')
  .then(data => {
    // RICEVO: data è l'oggetto elaborato che la funzione ha restituito
    // data = {city: "London", country: "UK", temperature: 18, weather: "Partly cloudy", airport: "Heathrow"}
    console.log(data)

    // FORMATTAZIONE: Creo un messaggio leggibile per l'utente
    let message = '';

    // CONTROLLO 1: Se ho città e paese, aggiungo la prima frase
    if (data.city && data.country) {
      message += `${data.city} is in ${data.country}.\n`;
    }

    // CONTROLLO 2: Se ho temperatura e meteo, aggiungo la seconda frase
    if (data.temperature && data.weather) {
      message += `Today there are ${data.temperature} degrees and the weather is ${data.weather}.\n`;
    }

    //CONTROLLO 3: Se ho aeroporto, aggiungo la terza frase
    if (data.airport) {
      message += `The main airport is ${data.airport}.\n`;
    }

    // STAMPO: Il messaggio finale formattato
    console.log(message);
  })
  .catch(error => {
    // GESTIONE ERRORI: Se qualcosa va storto, stampo l'errore
    console.error('Errore nella funzione getDashboardData:', error);
  });
