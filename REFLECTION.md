# Inledning

I feedback på L1 menade examinatorn att jag var lite väl konkret. Jag borde ha resonerat fram och tillbaka och väg saker mot varandra. Jag försökte bocka av alla checkboxar, lista referenser till kurslitteraturen.

Den här gången kommer jag därför ha ett mer berättande språk och i mindre grad stänga in texten i tabeller och listor. Jag använder fotnoter för att koppla mina resonemang till kurslitteraturen.

# Reflektioner efter arbetet med L2

Robert C. Martin skriver i Clean code att hans funktioner först är långa, har många argument, har nestade loopar osv[^1]. När eländet väl fungerar och hans enhetstester lyser grönt, **då** börjar arbetet med refaktorering för att göra koden ren.

Jag har tänkt i liknande banor. Speciellt med L2 när jag skulle ge mig i kast med websockets genom biblioteket [socket.io](https://github.com/socketio/socket.io) Min tanke var att först få allt att fungera efter kraven, sen strukturera upp allt på ett bra sätt.

Jag lyckades bra med klientsidan. Jag stötte på patrull på serversidan.

## Websockets klientsidan

Ett exempel på vad jag vill åt är konstruktorn för [lets-chat](/public/js/components/lets-chat.js):

```
this.#addSelectors();
this.#addEventListeners();
this.#connectWebsocketClient();
this.#addEventHandlers();
```

Beskrivande namn. Hög abstraktionsnivå. Kommentarer överflödiga.

Om vi går vidare till eventHanterarna är jag också nöjd. Läsaren av den här koden förstår redan ganska mycket utan att ha sett någon [socket.io](https://github.com/socketio/socket.io) syntax eller konkreta operationer.

```
    #addEventHandlers = () => {
      this.#onSession();
      this.#onUsers();
      this.#onUserConnect();
      this.#onUserDisconnect();
      this.#onMessages();
      this.#onPrivateMessage();
    };
```

Först mycket djupare ner i koden kommer operationer med strängar, jämförelser av variabler, skicka events osv. Jag inspirerades av tanken av att läsa koden som en nyhetstidning med titel,synopsis och sen detaljer. [^2]

## Websockets serversidan

När allting fungerade enligt mina krav, och jag gjort refaktorering av klientsidan, så gav jag mig på serversidan med websocketskoden.

Jag skapade en [SocketManager](/src/server/SocketManager.js)-klass och fick en relativt kort, konkret [server.js](/src/server.js) där applikationen startas. När jag skulle börja bryta upp koden, dela in i olika abstraktionsnivåer och ge namn så fick jag problem. Sockets började blanda sig med varandra. Jag misstänker att det har att göra med synkrona/asynkrona anrop som blir fel.

Jag vet vad jag vill göra med [SocketManager](/src/server/SocketManager.js). Jag kan inte ha all logik i en stor `handleConnection`-funktion. Jag vill dela upp i abstraktionsnivåer och skapa mindre funktioner så de gör färre saker. `handleConnection` **är oacceptabel**.

![Bad function](/img/bad_function.png "bad function")

Jag har problem dock. Jag förstår [socket.io](https://github.com/socketio/socket.io) för dåligt för att kunna ändra koden. Här har jag tagit mig vatten över huvudet. Om jag skippat websockets så hade jag inte stött på det här hindret.

## Slutsats websockets

Jag tror jag byggde för stor fungerande, dålig kod innan jag började refaktorera. Det känns för stort och tråkigt att ta tag i vid det här laget. Här är en stor lärdom. Visst, bygg fult först så det fungerar, men bygg inte för mycket fulheter. Små chunks och sen refaktorering.

Det är dock bra att jag fick undan websocketlogiken från [server.js](/src/server.js) och kappslar in en stor del av koden i privata funktioner. [^3] Nu förstör man inte websocketfunktionalitet om man ändrar i [server.js](/src/server.js). Jag säger också tydligt att vi har en [SocketManager](/src/server/SocketManager.js). Andra utvecklare kan ta del och arbeta med den delen av koden i den klassen.

I fortsatt arbete med [SocketManager](/src/server/SocketManager.js) hade jag garanterat skapat fler klasser, gjorde dem mindre. [^4] Så som jag gjorde på klientsidan. Kanske en `ChatSocket`-klass som ett första steg?

## DRY (Don't repeat yourself)

Jag gör mig garanterat skyldig till upprepning i koden. Det tog för mycket tid att sätta mig in i de bibliotek jag behöver använda för att uppfylla kraven. Jag är dock medveten om regeln G5 Duplication. [^5]

Ett exempel på hur jag vill skriva kod för att undvika kodduplicering är funktionen `createMessageFromRow` i [Message](/src/model/Message.js).

!["DRY exempel"](./img/dry_function.png "DRY example")

Funktionen har ett tydligt, beskrivande namn. Den gör en sak. Den möjliggör att vi kan undvika kodduplicering, eftersom vi behöver konvertera en databasrad till ett meddelande på många platser i modellen.

## Felhantering

När man skapar en användare eller ett meddelande så lyckas antingen operationen och ett användar- eller meddelandeobjekt returneras. Om det går fel kastar jag ett fel.

Jag returnerar inte null. [^6]

Jag förser utvecklaren med kontext. [^7]

```
throw Error("Could not add user " + username);
```

```
throw Error("No user with username: " + username);
```

I `getMessages` i [Message](/src/model/Message.js) returnerar jag en array med meddelande. Om det inte finns några meddelande blir det en tom array.

Jag returnerar inte felkoder eller boolean. [^8]

## Kommentarer

Jag blev faktiskt ganska inspirerad av den negativa inställningen till kommentarer i kurslitteraturen. Jag är trött på att scrolla igenom långa filer med ändlösa jsdoc-kommentarer utan syfte (noise comments). [^9]

7 argument till en funktion och sen en vägg av jsdoc som inte tillför något. Man får huvudvärk. Jag har sett många projekt som verkar ha obligatoriska kommentarer, och de tar i regel bara upp plats utan att berätta något. [^10]

Jag har inte en enda kommentar i koden. Det är förmodligen fel. I min nuvarande utvecklingskurva som programmerare fokuserar jag dock på bra namngivning av variabler och funktioner istället. Jag försöker skapa en förklarande funktion istället för en kommentar. [^11]

I min egen kod har jag också sett hur kommentarer åldras dåligt. När kommentaren skrivs beskriver den i bästa fall något viktigt. Men det är så lätt hänt att man ändrar koden och inte kommentaren så att kommentaren i slutändan ljuger om någonting.

Jag har en tendens att ibland kommentera ut kod. Jag kanske utvärderar ett alternativt sätt att lösa ett problem. Men jag vill ha kvar originallösningen. Detta försöker jag undvika och har tagit bort all utkommenterad kod i Letschat. Vi har versionshanteringssystem, jag borde sluta ängslas och ta bort kod istället för att kommentera ut. [^12]

Ryggmärksreaktionen för mig efter kapitel 5 var att sluta helt med kommentarer. Lite ögonöppnande och förlösande ska jag erkänna. Jag tror att jag rätt snart kommer börja skriva lite kommentarer igen. Jag tycker dock det är lite knivigt. Det är mycket enklare att ta till sig av namngivning och funktioner från kurslitteraturen och sen tillämpa det.

## Vad jag skäms mest över

Denna kod i [SocketManager](/src/server/SocketManager.js) är det som jag skäms mest över i hela applikationen:

```
 for (let [id, s] of this.#io.of("/").sockets) {
        let userExists = false;
        users.forEach((user) => {
          if (user.userId == s.userId) {
            userExists = true;
          }
        });
        if (userExists) {
          continue;
        }
        if (s.userId == socket.userId) {
          continue;
        }
        users.push({
          socketId: s.socketId,
          userId: s.userId,
          username: s.username,
        });
      }
```

För det första. Jag använder namnet `s` bara för att socket är upptaget.

För det andra `if (s.userId == socket.userId)` kunde varit en funktion i stil med isMyself, så som jag gjort på klientsidan.

För det tredje. Denna for-loop kunde lyfts ut till en funktion med ett meningsfullt namn, kanske `getUniquePeerUsersInSockets`? Eller bara `getPeerUsers`? Måste vi veta att de är unika när vi läser funktionsnamnet? Antagligen inte.

För det fjärde, jag har nestade for-loopar. Den inre for-loopen borde kunna lyftas ut till en enkel `userExists`-funktion

Men jag förstår `socket.io` för dåligt och om jag börjar bryta ut så slutar applikationen att fungera. Jag vet vad som är fel, vad jag vill ändra, men har för lite kunskap om biblioteken jag är beroende av.

## Kodformat

Jag försöker placera kod längs vertika axel på ett förutsägbart sätt. Jag försöker tänka på det vertikala avståndet mellan olika typer av kod, för att skapa god kodkvalitet. [^13]

Längst upp, efter klassdeklarationen, lägger jag instansvariabler. Precis som konventionen är inom Java. [^14]

Sen kommer konstruktorn. Fyra stora kategorier på hög abstraktionsnivå. Man kan tänka sig att vi vill lägga till fler selektorer eller eventhanterare längre fram. Då vet vi var vi ska lägga dem.

```
this.#addSelectors();
this.#addEventListeners();
this.#connectWebsocketClient();
this.#addEventHandlers();
```

Efter konstruktorn definieras funktionerna i samma ordning som de anropas.

I regel väljer jag sen att lägga funktioner som blir anropade precis under de som anropar, så som det beskrivs i kurslitteraturen. Jag tänker oftast så. Det är mer sällan jag väljer att placera funktioner vertikalt med grund i att de är viktiga för förståelsen av föregående kod.

Längst ner har i mina klasser har jag korta, ofta självförklarande boolean checks:

```
#isMyself = (userId) => {
      return this.#socket.userId == userId;
    };
```

Antalet rader tycker jag dock påverkar läsbarhet och upplevelsen man har som utvecklare när man arbetar med koden. I det avseendet tycker jag [lets-chat.js](/public/js/components/lets-chat.js) är på gränsen. Ok, det är den sammanhållande komponenten på klientsidan och den har mycket ansvar. Kanske för mycket.

Den ligge runt 200 rader vilket är på smärtgränsen. Jag vill gärna behöva scrolla så lite som möjligt. Små filer är i regel lättare att förstå än långa filer. [^15]

[^1]: Clean code, s. 49.
[^2]: Clean code, s. 77-78.
[^3]: Clean code, s. 136.
[^4]: Clean code, s. 136.
[^5]: Clean code, s. 289.
[^6]: Clean code, s. 110.
[^7]: Clean code, s. 107.
[^8]: Clean code, s. 104.
[^9]: Clean code, s. 64.
[^10]: Clean code, s. 63.
[^11]: Clean code, s. 67.
[^12]: Clean code, s. 69.
[^13]: Clean code, s. 80-81.
[^14]:
    Clean code, s. 81.
    [^15]: Clean code, s. 77.
