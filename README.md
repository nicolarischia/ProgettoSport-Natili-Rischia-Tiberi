![mockup_iniziale](https://github.com/user-attachments/assets/fe707b60-79fc-44e6-980d-705cbbe16c1c)

# Relazione Tecnica Backend

## Tecnologie Utilizzate
- **Node.js**: Ambiente di esecuzione JavaScript lato server.
- **Express.js**: Framework per la creazione di API RESTful.
- **MongoDB**: Database NoSQL per la gestione dei dati.
- **Mongoose**: ODM per la modellazione dei dati MongoDB.
- **JWT**: Gestione dell'autenticazione tramite JSON Web Token.
- **bcrypt**: Hashing delle password per la sicurezza degli utenti.

## Architettura
Il backend segue un'architettura RESTful, suddivisa in moduli:
- **Modello (Model)**: Definisce la struttura dei dati tramite Mongoose.
- **Controller**: Gestisce la logica applicativa e le operazioni CRUD.
- **Router**: Gestisce le rotte HTTP e collega i controller alle richieste.
- **Middleware**: Gestisce autenticazione, autorizzazione e validazione dei dati.

## Funzionalità Principali
- **Gestione utenti**: Registrazione, login, autenticazione e autorizzazione.
- **Gestione eventi sportivi**: Creazione, modifica, eliminazione e visualizzazione eventi.
- **Prenotazioni**: Possibilità per gli utenti di prenotare eventi.
- **Gestione ruoli**: Distinzione tra utenti normali e amministratori.


La sicurezza rappresenta un aspetto fondamentale dell’architettura backend. Sono state adottate diverse strategie per garantire la protezione dei dati e delle operazioni:

- **Hashing delle password**: Le password degli utenti vengono salvate in formato criptato utilizzando la libreria bcrypt, che applica un algoritmo di hashing sicuro e un salt casuale per ogni password, rendendo difficile la compromissione anche in caso di accesso non autorizzato al database.

- **Autenticazione tramite JWT**: L’accesso alle risorse protette avviene tramite JSON Web Token. Dopo il login, viene generato un token firmato che l’utente deve includere nelle richieste successive. Questo sistema permette di identificare e autenticare gli utenti senza dover gestire sessioni lato server.
- **Validazione dei dati**: Tutti i dati in ingresso vengono validati sia lato client che lato server, utilizzando middleware dedicati. Questo riduce il rischio di attacchi come SQL/NoSQL Injection e garantisce l’integrità delle informazioni trattate.

- **Autorizzazione e protezione delle rotte**: Le rotte sensibili sono protette da middleware che verificano il ruolo dell’utente (ad esempio, solo gli amministratori possono accedere a determinate funzionalità). Questo impedisce accessi non autorizzati e garantisce che ogni utente possa eseguire solo le operazioni consentite dal proprio ruolo.

- **Gestione degli errori e logging**: Il sistema implementa una gestione centralizzata degli errori e un sistema di logging per monitorare attività sospette o anomalie, facilitando l’individuazione e la risoluzione di eventuali vulnerabilità.

- **Gestione sicura delle variabili d’ambiente**: Le informazioni sensibili, come le chiavi segrete per la firma dei token e le stringhe di connessione al database, sono gestite tramite variabili d’ambiente e non vengono mai incluse direttamente nel codice sorgente.
- **CORS e sicurezza delle API**: Le policy CORS sono configurate per limitare l’accesso alle API solo da domini autorizzati, riducendo il rischio di attacchi Cross-Site Request Forgery (CSRF) e Cross-Site Scripting (XSS).

Queste misure, integrate tra loro, contribuiscono a garantire un elevato livello di sicurezza per gli utenti e per i dati gestiti dall’applicazione.

- Password criptate con bcrypt.
- Autenticazione tramite JWT.
- Validazione dei dati in ingresso.
- Protezione delle rotte sensibili tramite middleware di autorizzazione.

## Deployment
Il backend può essere eseguito in locale o distribuito su servizi cloud come Heroku o Vercel. Le variabili sensibili sono gestite tramite file `.env`.

## Conclusioni
Il backend è progettato per essere scalabile, sicuro e facilmente estendibile, garantendo una solida base per l'applicazione sportiva.
