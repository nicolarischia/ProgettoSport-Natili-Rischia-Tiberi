![mockup_iniziale](https://github.com/user-attachments/assets/fe707b60-79fc-44e6-980d-705cbbe16c1c)

# F1 - Analytics

### Autori
- [Nicola Rischia] - Frontend
- [Filippo Tiberi] - Backend
- [Edoardo Natili] - Gestione dati e database

---

## Introduzione

F1 Analytics è un'applicazione web moderna progettata per fornire analisi approfondite e visualizzazioni interattive dei dati della Formula 1. Il progetto nasce dall'esigenza di offrire agli appassionati e agli analisti del motorsport uno strumento completo per l'analisi delle performance, delle statistiche e delle tendenze nel mondo della Formula 1.

### Descrizione del Problema

Il mondo della Formula 1 genera una quantità enorme di dati durante ogni gara, test e sessione di qualifica. Questi dati, sebbene disponibili, sono spesso:
- Dispersi in diverse fonti
- Presentati in formati non facilmente analizzabili
- Difficili da correlare e visualizzare in modo efficace
- Non facilmente accessibili in tempo reale

F1 Analytics si propone di risolvere questi problemi attraverso:
1. **Centralizzazione dei Dati**: Aggregazione di dati provenienti da diverse fonti in un'unica piattaforma
2. **Visualizzazione Interattiva**: Presentazione dei dati attraverso grafici e dashboard interattive
3. **Analisi in Tempo Reale**: Monitoraggio live delle performance durante le sessioni
4. **Personalizzazione**: Possibilità per gli utenti di creare e salvare le proprie analisi
5. **Accessibilità**: Interfaccia intuitiva e responsive per tutti i dispositivi

### Credenziali Amministratore
email: admin@formula1.com
password: admin

---

# Relazione Tecnica Frontend

## 1. Panoramica del Progetto
Il frontend dell'applicazione F1 Analytics è stato sviluppato utilizzando React.js come framework principale, con Vite come build tool. L'applicazione è stata progettata per fornire un'interfaccia utente moderna e reattiva per l'analisi dei dati della Formula 1.

### 1.1 Obiettivi del Progetto
- Creare un'interfaccia intuitiva per l'analisi dei dati F1
- Fornire visualizzazioni in tempo reale delle statistiche
- Implementare un design responsive e accessibile
- Ottimizzare le performance per una migliore user experience

## 2. Stack Tecnologico
- **Framework**: React.js 18.2.0
  - Utilizzo di React Hooks per la gestione dello stato e degli effetti collaterali
  - Implementazione di componenti funzionali per una migliore manutenibilità
- **Build Tool**: Vite 5.0.0
  - Hot Module Replacement (HMR) per uno sviluppo più veloce
  - Build ottimizzata per la produzione
- **UI Framework**: Material-UI (MUI) 5.14.18
  - Componenti predefiniti per un'interfaccia coerente
  - Sistema di theming personalizzabile
  - Supporto per dark/light mode
- **Routing**: React Router DOM 6.19.0
  - Gestione delle route dinamiche
  - Protezione delle route con autenticazione
- **Gestione delle Richieste HTTP**: Axios 1.6.2
  - Interceptors per la gestione globale delle richieste
  - Gestione centralizzata degli errori
- **Visualizzazione Dati**: Chart.js 4.4.0 con react-chartjs-2 5.2.0
  - Grafici interattivi e responsive
  - Supporto per multiple tipologie di visualizzazione

## 3. Struttura del Progetto
```
client/
├── src/
│   ├── assets/         # Risorse statiche
│   ├── components/     # Componenti riutilizzabili
│   ├── context/        # Context API per la gestione dello stato globale
│   ├── pages/          # Componenti delle pagine principali
│   │   ├── admin/      # Pagine amministrative
│   │   └── ...         # Altre pagine
│   ├── services/       # Servizi per le chiamate API
│   ├── styles/         # File CSS e stili
│   ├── utils/          # Funzioni di utilità
│   ├── App.jsx         # Componente principale
│   └── main.jsx        # Punto di ingresso
```

## 4. Architettura
L'applicazione segue un'architettura basata su componenti, organizzata in modo modulare per garantire manutenibilità e scalabilità:

### 4.1 Pattern di Design
- **Componenti**: Implementati come componenti funzionali React con hooks
  - Custom hooks per la logica riutilizzabile
  - HOC (Higher Order Components) per funzionalità cross-cutting
- **Gestione dello Stato**: 
  - Context API per lo stato globale
  - React Query per la gestione dello stato del server
  - Local state per componenti isolati
- **Routing**: 
  - Implementato con React Router per la navigazione tra le pagine
  - Route guards per la protezione delle pagine
  - Lazy loading delle route per ottimizzare il bundle size

### 4.2 UI/UX
- Material-UI per un'interfaccia utente coerente e responsive
  - Sistema di grid responsive
  - Componenti accessibili
  - Supporto per RTL (Right-to-Left)
- Design System personalizzato
  - Palette colori coerente
  - Tipografia scalabile
  - Spacing system

## 5. Funzionalità Principali
### 5.1 Autenticazione e Autorizzazione
- Login e registrazione utenti
- Protezione delle rotte per utenti autenticati
- Gestione ruoli (utente/admin)
- Persistenza della sessione

### 5.2 Dashboard Principale
- Visualizzazione overview delle statistiche
- Accesso rapido alle funzionalità principali
- Layout responsive e moderno

### 5.3 Gestione Piloti
- Visualizzazione lista piloti
- Statistiche dettagliate per pilota
- Gestione amministrativa dei piloti

### 5.4 Gestione Gare
- Lista delle gare
- Dettagli e statistiche per gara
- Storico risultati

### 5.5 Statistiche
- Visualizzazione dati statistici
- Grafici e analisi
- Filtri e ricerca

### 5.6 Predizioni
- Sistema di predizione risultati
- Storico predizioni
- Gestione amministrativa delle predizioni

### 5.7 Gestione Scuderie
- Lista scuderie
- Statistiche per scuderia
- Gestione amministrativa

### 5.8 Pannello Amministratore
- Dashboard admin
- Gestione utenti
- Gestione contenuti
- Monitoraggio sistema

## 6. Sicurezza e Performance
### 6.1 Sicurezza
- Implementazione di rotte protette
- Gestione ruoli utente
- Validazione input
- Protezione delle API

### 6.2 Performance
- Lazy loading dei componenti
- Ottimizzazione delle immagini
- Caching delle richieste
- Gestione efficiente dello stato

### 6.3 Manutenibilità
- Codice modulare e riutilizzabile
- Struttura delle cartelle chiara
- Documentazione inline
- Separazione delle responsabilità

### 6.4 Sviluppi Futuri
- Miglioramento delle performance
- Aggiunta di nuove funzionalità statistiche
- Ottimizzazione mobile
- Implementazione di test automatizzati

## 7. Conclusioni
Il frontend dell'applicazione F1 Analytics è stato sviluppato seguendo le best practices moderne dello sviluppo web, utilizzando tecnologie all'avanguardia e mantenendo un focus sulla user experience e le performance. L'architettura modulare e la struttura del codice permettono una facile manutenzione e scalabilità del progetto. 

---

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

---

## Fonti Principali
ChatGPT, Progetti svolti in classe, Esercitazioni a casa