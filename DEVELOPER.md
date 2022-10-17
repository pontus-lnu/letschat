# Vision

Visionen med letschat är att vara en snabb chat som använder websockets samtidigt som användarnamn och lösenord krypteras vid lagring. Den fyller ett behov för användare som efterfrågar chat med extra säkerhet vid lagring.

# Krav

## Funktionella krav

1. Autentisering
   1. Man ska kunna registrera sig med användarnamn och lösenord
   2. Man ska kunna logga in med användarnamn och lösenord
   3. Användarnamn måste vara unikt
2. Användarlista
   1. Man ska kunna se alla som är inloggade
   2. Om en användare loggar in två gånger ska användarnamnet bara visas en gång
   3. Det ska gå att gömma användarlistan
   4. Scrollning
      1. När man väljer en användare scrollas skärmen längst ner så det senaste meddelandet syns
      2. När ett nytt meddelande skickas scrollas skärmen längst ner så det senaste meddelandet syns
3. Meddelande
   1. Om man skickar ett meddelande ser motparten det utan att ladda om sidan
   2. Datum och tid visas för varje meddelande
4. Kryptering
   1. Användarnamn ska krypteras vid lagring
   2. Det ska skapas en hash av lösenordet vid lagring
   3. Meddelande ska krypteras vid lagring

## Icke-funktionella krav

1. Klientsidan ska byggas med webbkomponenter
2. Serversidan ska använda sig av Express
3. Postgres ska användas för persistent lagring
4. Meddelande ska sparas på servern

# Tester

Testdatum: **2022-10-17**  
Version av Letschat som har testats: **1.0.0**

## Funktionella krav

| Krav  | Test                                                                                                                                                                                                                                                                                           | Beskrivning                                                | Resultat |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------- |
| 1.1   | <ol><li>Klicka på `Sign up`</li><li>Indata: username=alice, password=mysecretpassword</li><li>Användaren skapas</li> </ol>                                                                                                                                                                     | Registrera användare                                       | OK       |
| 1.2   | <ol><li>Klicka på `Login`</li><li>Indata: username=alice, password=mysecretpassword</li><li>Användaren logas in</li> </ol>                                                                                                                                                                     | Logga in                                                   | OK       |
| 1.3   | <ol><li>Klicka på `Sign up`</li><li>Indata: username=alice, password=mysecretpassword</li><li>Användaren skapas inte</li></ol>                                                                                                                                                                 | Unikt användarnamn                                         | OK       |
| 2.1   | <ol><li>Registrera två användare</li><li>Logga in användarna användare 1 i en webbläsare</li><li>Logga in användare 2 i en annan webbläsare</li> </ol>                                                                                                                                         | Användarna ser varandra i användarlistan                   | OK       |
| 2.2   | <ol><li>Registrera två användare</li><li>Logga in användarna användare 1 i en webbläsare</li><li>Logga in användare 2 i en annan webbläsare</li><li>Logga in användare 2 i en privat flik i samma webbläsare</li><li> Användare 2 syns bara en gång i användarlistan hos användare 1</li></ol> | Visa bara användare en gång i användarlistan               | OK       |
| 2.3   | <ol><li>Logga in med en användare</li><li>Klicka på hamburgermenyn längst upp i användarlistan</li><li>Användarlistan döljs</li></ol>                                                                                                                                                          | Dölj användarlistan                                        | OK       |
| 2.4.1 | <ol><li>Logga in med två användare som har skickat ett sådant antal meddelande till varandra att de inte får plats på skärmen</li><li>Klicka på den andra användaren i användarlistan</li><li>Sidan scrollas ner så det senaste meddelandet syns</li></ol>                                     | Scrolla ner vid laddning av meddelande                     | OK       |
| 2.4.2 | <ol><li>Logga in med två användare som har skickat ett sådant antal meddelande till varandra att de inte får plats på skärmen</li><li>Skicka ett nytt meddelande</li><li>Sidan scrollas ner så det nya meddelandet syns</li></ol>                                                              | Scrolla ner sidan vid nytt meddelande                      | OK       |
| 3.1   | <ol><li>Logga in med två användare</li><li>Skicka ett nytt meddelande</li><li>Meddelandet visas hos motparten utan att denne behöver ladda om sidan</li></ol>                                                                                                                                  | Visa meddelande hos motpart utan att behöva ladda om sidan | OK       |
| 3.2   | <ol><li>Logga in med två användare</li><li>Skicka ett nytt meddelande</li><li>Datum och tid för meddelandet visas hos båda parter</li></ol>                                                                                                                                                    | Visa datum och tid för meddelande                          | OK       |
| 4.1   | <ol><li>Skapa en användare med namn `alice`</li><li>Säkerställ att användarnamnet är `kvsmo` i databasen.</li></ol>                                                                                                                                                                            | Kryptering av användarnamn                                 | OK       |
| 4.2   | <ol><li>Skapa en användare med lösenord `Alice123!`</li><li>Säkerställ att lösenordet är `637868330686325` i databasen.</li></ol>                                                                                                                                                              | Hashning av lösenord                                       | OK       |
| 4.3   | <ol><li>Skicka ett meddelande med innehåll `Let's send a lot of messages!`</li><li>Säkerställ att meddelandet sparats som `)o4M3ö3oynökövz4özpöxo33kqo3,` i databasen.</li></ol>                                                                                                               | Kryptering av meddelande                                   | OK       |

## Icke-funktionella krav

1. Klientsidan ska byggas med webbkomponenter
   Klientsidan har byggs upp med följande webbkomponenter

| Komponent             | Beskrivning                                                        |
| --------------------- | ------------------------------------------------------------------ |
| lets-chat             | huvudkomponent som binder ihop och använder de andra komponenterna |
| user-list             | användarlistan                                                     |
| chat-user             | användare som presenteras i användarlistan                         |
| chat-messages         | container för chatmeddelanden                                      |
| chat-message-sent     | chatmeddelande som skickats av inloggad användare                  |
| chat-message-received | chatmeddelande som tas emot av inloggad användare                  |
| chat-input            | modul för att ta emot text från användaren                         |

2. Serversidan ska använda sig av Express

Vi använder `Express 4.18.1`

3. Postgres ska användas för persistent lagring

Vi använder `pg 8.8.0` för att kommunicera med Postgres. Funktionerna för att kommunicera med postgres är inbyggda i modellerna `Message` och `User`.

4. Meddelande ska sparas på servern

Alla meddelande sparas på servern genom den publika funktionen `createMessage` hos `Message`-klassen.
