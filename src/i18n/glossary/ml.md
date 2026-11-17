# Malayalam glossary

Recurring terms in `public/locales/ml/*.json`. The voice is everyday spoken-written Malayalam, the way a Malayali developer talks to a client or a hiring manager: first person, short sentences, no newspaper or government register.

## Code-mixing rule

Tech and office words that Malayalis say in English stay English. Write them in Malayalam script when that is how people commonly write them (ആപ്പ്, പ്രോജക്റ്റ്, ഡാറ്റാബേസ്, സെർവർ, ബാക്കെൻഡ്, ഡിപ്ലോയ്, ക്യൂ, റിക്വസ്റ്റ്, പെർമിഷൻ, മെസേജ്). Product, library and technology names and code-like jargon stay in Latin script (NestJS, PostgreSQL, Redis, BullMQ, Kafka, TallyPrime, GST, API, URL, ERP, OTP, idempotency) and take Malayalam case endings after a hyphen: `PostgreSQL-ൽ`, `API-യും`, `Tally-യുമായി`. Never coin a Malayalam word nobody uses. "Sudhi S" stays in Latin where it is the brand (site name, copyright, page titles); running prose uses സുധി.

## Buttons and UI

- Buttons, links and calls to action use the polite imperative in -ൂ: അയയ്ക്കൂ, കാണൂ, തുറക്കൂ, അടയ്ക്കൂ, പോകൂ, ഡൗൺലോഡ് ചെയ്യൂ, ഹയർ ചെയ്യൂ. Not the -ുക form.
- Form errors say what to do, in the same -ൂ form: "നിങ്ങളുടെ പേര് എഴുതൂ." A soft request may use -ാമോ ("…താഴെയാക്കാമോ?"). No ദയവായി.
- Section headings that invite an action use -ാം: ബന്ധപ്പെടാം, "ഒരു മെസേജ് അയയ്ക്കാം".
- Case-study decision titles are short noun phrases or statements, not imperatives: "ഡൊമെയ്ൻ അനുസരിച്ച് ക്യൂ ഷാർഡിങ്", "ഡിഫുകൾ വേറെ, കമ്മിറ്റുകൾ വേറെ".

## Terms

| English | Malayalam used | Note |
| --- | --- | --- |
| build (verb) | ഉണ്ടാക്കുക | "ഞാൻ ഉണ്ടാക്കിയത്". Not നിർമ്മിക്കുക. |
| project | പ്രോജക്റ്റ് | Plural പ്രോജക്റ്റുകൾ. "Personal project" is സ്വന്തം പ്രോജക്റ്റ്. |
| case study | കേസ് സ്റ്റഡി | Plural കേസ് സ്റ്റഡികൾ. |
| work (portfolio work) | വർക്ക് | Nav and page title വർക്ക്; in prose and buttons the plural വർക്കുകൾ ("എല്ലാ വർക്കുകളും കാണൂ", "ഞാൻ ചെയ്ത ചില വർക്കുകൾ"). Not ജോലി, which means a job. "Works" (functions) is വർക്ക് ചെയ്യുക. |
| how I work | ഞാൻ ജോലി ചെയ്യുന്ന രീതി | ജോലി ചെയ്യുക is fine for the act of working. |
| message | മെസേജ് | Plural മെസേജുകൾ. Used everywhere, including the contact form and "എറർ മെസേജ്". Not സന്ദേശം. |
| conversation (contact chat thread) | ചാറ്റ് | "നിങ്ങളുടെ ചാറ്റ്", "ഈ ചാറ്റ് അവസാനിച്ചു". Not സംഭാഷണം. |
| send | അയയ്ക്കുക | Buttons: "മെസേജ് അയയ്ക്കൂ". |
| contact | കോൺടാക്റ്റ് / ബന്ധപ്പെടാം | Nav item കോൺടാക്റ്റ്; page heading, home section heading and page title ബന്ധപ്പെടാം; in prose "കോൺടാക്റ്റ് പേജ്". |
| address (email, IP) | അഡ്രസ് | Not വിലാസം. |
| real (system, users) | ശരിക്കുള്ള | "ശരിക്കുള്ള സിസ്റ്റത്തിൽ ടെസ്റ്റിങ്", "ശരിക്കുള്ള യൂസർമാർ". |
| safe | സേഫ് | "മെസേജ് ഈ ബ്രൗസറിൽ സേഫ് ആണ്". |
| share | ഷെയർ ചെയ്യുക | Not പങ്കിടുക. |
| call (one service calling another) | കോൾ ചെയ്യുക | |
| reject | റിജക്റ്റ് ചെയ്യുക / റിജക്റ്റ് ആവുക | For mail and payments. The contact page says "സ്വീകരിച്ചില്ല" for the chat server, for a wider audience. |
| recipient (email) | മെയിൽ കിട്ടുന്നയാൾ | Not സ്വീകർത്താവ്. |
| staff | സ്റ്റാഫ് | |
| job title | ഡെസിഗ്നേഷൻ | As said in Kerala offices. Not തസ്തിക. |
| document | ഡോക്യുമെന്റ് | Not രേഖ. |
| food wholesaler | ഫുഡ് ഹോൾസെയിൽ ബിസിനസ് | Case forms ബിസിനസിന്, ബിസിനസിന്റെ. Not മൊത്തവ്യാപാരി. |
| merchants (ONDC) | കച്ചവടക്കാർ | "500-ൽ കൂടുതൽ കച്ചവടക്കാർ". |
| queue | ക്യൂ | Plural ക്യൂകൾ. Code tokens such as `queue:priority` stay as written. |
| service | സർവീസ് | Plural സർവീസുകൾ (backend services). |
| server | സെർവർ | "സെർവർ ഡൗൺ ആണ്". |
| database | ഡാറ്റാബേസ് | |
| chat | ചാറ്റ് | |
| role (job role) | റോൾ | Plural റോളുകൾ. Also the case-study label "റോൾ". |
| open to work | ... റോളുകൾ നോക്കുന്നുണ്ട് | Said as a sentence, not a badge phrase. Same wording in home and meta. |
| backend-leaning / backend-heavy | ബാക്കെൻഡ് കൂടുതലുള്ള | Not മുൻതൂക്കമുള്ള. |
| experience (section) | എക്സ്പീരിയൻസ് | |
| updated | അപ്ഡേറ്റ് ചെയ്തത് | Not പുതുക്കിയത്. |
| University of Kerala | കേരള യൂണിവേഴ്സിറ്റി | As people say it. UIT Pirappancode is "UIT പിരപ്പൻകോട്"; in prose "പിരപ്പൻകോട്ടുള്ള UIT". |
| resume | റെസ്യൂമെ | The PDF itself is in English, and the about page says so. |
| backend | ബാക്കെൻഡ് | |
| frontend | ഫ്രണ്ട്എൻഡ് | |
| full-stack | ഫുൾ-സ്റ്റാക്ക് | |
| developer | ഡെവലപ്പർ | "Junior Software Developer" is ജൂനിയർ സോഫ്റ്റ്‌വെയർ ഡെവലപ്പർ. |
| client project | ക്ലയന്റ് പ്രോജക്റ്റ് | Also used for "client work". |
| decision | തീരുമാനം | Plural തീരുമാനങ്ങൾ (case-study section heading). |
| staging | സ്റ്റേജിങ് | Locative സ്റ്റേജിങ്ങിൽ. Kept honest: "ഇപ്പോൾ സ്റ്റേജിങ്ങിൽ റൺ ചെയ്യുന്നുണ്ട്". |
| production | പ്രൊഡക്ഷൻ | |
| cache | കാഷെ | |
| characters (form limits) | അക്ഷരം | "കുറഞ്ഞത് 2 അക്ഷരം വേണം". In case-study prose, ക്യാരക്ടർ. |

Other choices that recur: request is റിക്വസ്റ്റ്; response is റെസ്പോൺസ്; permission is പെർമിഷൻ; tenant is ടെനന്റ്; the ERP's "desks" are ഡെസ്കുകൾ; "runs" (software) is റൺ ചെയ്യുക or ഓടുക; "heavy" (query, diff) is ഹെവി; one-time password is OTP.
