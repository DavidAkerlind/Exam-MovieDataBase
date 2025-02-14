![logo](/template/res/logo.png)

# Individuellt examensarbete - MyMovieDatabase

## Introduktion

Hej där, kodmästare! Det är dags att sätta på våra virtuella regissörskepsar och börja rulla kameran på vår egen version av en klassisk filmindustri-epos - vår alldeles egna filmdatabas! Vi har tränat, vi har kodat och nu är det dags att visa världen vad vi kan åstadkomma med våra HTML-, CSS-, och framförallt JavaScript-färdigheter. Så spänn fast era säkerhetsbälten och förbered er på en episk resa genom bland annat funktioner, objekt, eventhantering och API-anrop. Tillsammans kommer vi att skapa en filmälskares våta dröm och bevisa att när det gäller kod, så finns det - likt i filmens värld - inga gränser för vad vi kan uppnå!

## Instruktioner

### Uppgift

Ditt uppdrag är att skapa en webbapplikation som liknar IMBD (Internet Movie Database) där användare kan söka efter filmer, visa detaljerad information om filmer och lista sina favoritfilmer med mera.

I repot hittar ni mappen **template** innehållandes startkod som ni får använda er av. Ni får jättegärna hitta på en egen design också, men i template-mappen hittar ni ett tema med filer osv som ni kan köra vidare på om så önskas. Väljer ni att skapa någonting eget så förväntar jag mig att ambitionsnivån rent stilistiskt MINST når upp till den applikation som visas under genomgången.

### Tekniska Krav

#### För godkänt

- På startsidan MÅSTE ni presentera 5 slumpmässiga trailers, samt hela topplistan för IMDBs 20 högts rankade filmer. Denna information läser ni in från [mitt filmAPI](https://santosnr6.github.io/Data/favoritemovies.json).
- Det MÅSTE finnas sökfunktionalitet. Vid sökning skall strängen från inputfältet användas för att göra en bred sökning i [OMDB-APIet](https://www.omdbapi.com/).
- Sökresultaten MÅSTE presenteras för användaren på ett tillfredsställande sätt där ni exempelvis kan skapa ett "kort" per film innehållandes titeln, samt en poster (Det är också tillåtet att istället för kort presentera sökresultaten i en automatisk lista med förslag på den input som användaren skriver in i sökfältet).
- Vid klick på ett sökresultat MÅSTE ni göra en ny, mer specifik sökning på [OMDB-APIet](https://www.omdbapi.com/) göras, baserat på den klickade filmens ImdbID. (Mer info om de olika sökningarna för APIet kommer nedan). Detta anrop kommer returnera mer specifik information om filmen som ni skall presentera för användaren (gärna på en egen sida).
- Ni måste skapa funktionalitet för att kunna spara ner filmer i en favoritlista, samt visa upp dessa på ett tillfredsställande sätt.
- Ni MÅSTE koda tillgängligt, dvs. alla bilder måste ha ALT-taggar, överanvänd inte DIV-element där de inte fyller någon funktion osv. Er sida kommer att granskas med ett tillgänglighetsverktyg (se nedan), där onödiga övertramp och Errors inte kommer att godkännas.
- Ni MÅSTE utöver _script.js_ och _caroussel.js_ skapa ytterligare 2 moduler som ni använder i ert kodande.
- Ni MÅSTE använda er av felhantering vid era API-anrop.
- Ni MÅSTE skapa en responsiv webbplats hela vägen ner till mobilvy. Inga element får sticka ut över kanter, eller utanför skärmen.
- Er webbplats MÅSTE ha ett acceptabelt utseende (ni får använda mitt template).

#### För Väl Godkänt

- Utöka ert användande av moduler där ni skapar skalbarhet på riktigt. Här kommer jag gå på hur väl uppdelad och skalbar er kod är (Exempel som inte kommer godkännas: att man gör api-anrop från en annan modul än _api.js_).
- Välskiven kod, med indenteringar!

### Verktyg/Resurser

#### santosnr6.github.io

Mitt eget film-API med våra egna rekommendationer är endast till för att ladda upp de inledande filmerna, samt trailers på startsidan innan användaren börjar interagera med sidan. Notera att APIet innehåller nycklar som överensstämmer med OMDBs API vilket gör att ni kan återanvända funktioner för att hantera datan både från mitt API och OMDBs.

```
https://santosnr6.github.io/Data/favoritemovies.json
```

#### OMDB

För att använda er av OMDBs film-API så behöver ni först av allt ansöka om en api-nyckel. Detta [hittar ni gratis här](https://www.omdbapi.com/apikey.aspx).
OMDBs film-API består av två olika typer av sökningar, en bred och en specifik. Den breda sökningen görs med en sträng som parameter och kommer att returnera de 10 första/bästa träffarna. Den breda sökningen innehåller inte särskilt mycket information utan bara det mest väsentliga som titel, poster, imdb-ID mm. URL för den breda sökningen:

```
http://www.omdbapi.com/?apikey=[yourkey]&s=[söksträng]
```

För att göra den mer specifika sökningen behöver ni använda er av det imdb-ID som den första sökningen genererade. Denna specifika sökning kommer att returnera mer specifik information om en specifik film. URL för den specifika sökningen:

```
http://www.omdbapi.com/?apikey=[yourkey]&plot=full&i=[imdb-ID]
```

#### Postman / Insomnia

Postman och Insomnia är kraftfulla verktyg för att testa GET-anrop mot APIer på grund av dess intuitiva gränssnitt som möjliggör enkel och snabb hantering av HTTP-förfrågningar och svar. De ger användarna möjlighet att skicka anpassade GET-förfrågningar till olika endpoints, visa svar i läsbar form och analysera svarsstatus, header och body för att validera API-beteende. Nedladdningslänk för Postman [hittar ni här](https://www.postman.com/downloads/), och för Insomnia [hittar ni här](https://insomnia.rest/).

#### WAVE Evaluation Tool

WAVE evaluation tool är användbart för att kontrollera tillgänglighet eftersom det identifierar tillgänglighetsproblem på webbsidor och ger användare detaljerade rapporter och rekommendationer för att förbättra tillgängligheten för människor med funktionsnedsättningar, vilket möjliggör för webbutvecklare att skapa mer tillgängliga och användarvänliga webbsidor. Installationslänk för tillägget [hittar ni här](https://chromewebstore.google.com/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh).

#### Template

I mappen finner ni även en template som ni får använda er av om ni vill. I denna har jag kodat upp basen för applikationen, dess färgtema, funktionalitet för en karusell med trailers osv. Ni får jättegärna använda er av denna, men det är även tillåtet att skapa ert eget projekt från scratch. Kom dock ihåg att er applikation MÅSTE vara visuellt acceptabel.

#### caroussel.js

I templaten ligger också filen *caroussel.js* som sköter hela mekaniken kring filmslidern längst upp på startsidan. Denna fil bör ni inte röra alls, utan det är färdig kod som fungerar, och som ni får av mig. För att rendera ut filmer till trailern har ni till er hjälp den exporterade funktionen *renderTrailers()* som tar emot en film och ett nummer(1-5) som motsvarar det index den inskickade filmer han. Notera att denna funktion inte tar emot en lista av filmer, utan ni behöver skapa en loop som går 5 varv, och där ni i varje varv anropar funktionen och skickar med aktuell film och nummer.

### VMA

I vanliga fall är det ingen kanonidé att lägga upp sina API-nycklar på Github då dessa är privata, och kan leda till att någon annan gör slut på era gratisanrop. I examinationer där vi använder API-nyckel vill jag dock att ni ändå lägger in API-nyckeln i er kod som pushas, då det inte är hållbart att jag skall behöva kopiera och klistra in 54 st API-nycklar för att få allas kod att fungera (rättningen är redan tillräckligt tråkig som den är). Är ni rädda för att pusha era nycklar så kan ni göra era repon privata istället. Glöm dock inte att bjuda in mig isåfall.

### Halvtidsuppföljning

Nästa fredag den 21/2 skall vi testa ett nytt grepp, nämligen halvtidsuppföljning. Jag och Jacob kommer samla er i mindre grupper om 4-5 studerande, där ni får visa upp vad ni hunnit med så långt, vad ni har störst problem med, insikter ni slagits av etc. Dessa möten kommer vara ca 20-25 minuter långa, så se till att komma väl förberedda där ni redan på förhand skrivit upp era eventuella funderingar. Detta gör vi för er skull, så vi kan säkerställa att ni får kontinuerlig feedback och inte halkar efter.

Jag vill att ALLA studerande bokar in sig på en tid [via denna länk](https://docs.google.com/spreadsheets/d/1lKzWxiD7DfwGqhaZ3meSbRFo8JYeOPn7LxYHKFAbusE/edit?usp=sharing).

### Inlämning

Inlämning av länken till ert publika Git-repo skall ske senast kl 23:59, fredagen den 28 februari på Azomo.

### Examination

Denna gång bedöms ni endast på er inlämning. Ingen presentation eller seminarium.
