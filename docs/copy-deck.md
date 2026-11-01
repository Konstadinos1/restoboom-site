# RestoBoom Marketing Site — Copy Deck v2.0

Date: 2026-10-31 · Decision: **Option B** — platform deck (Oct 18) is authoritative.
Product: restaurant growth platform (missed-call text-back, unified inbox, reviews, follow-ups, regulars).
Pricing: Solo 149 $ / Multi 449 $ / Franchise 1 299 $ CAD + setup fees. TPS/TVQ en sus.
Languages: French master at `/`, English mirror at `/en/`. Supabase stores diagnostic leads.
Supersedes: brief's "AI copywriting $19/$49" framing (retired). Inherits voice rules + claim register discipline from restoboom-site-copy.md v1.0.

Voice rules (inherited): one screen one idea · facts over adjectives (banned: puissant, innovant, solution complète, seamless, robust) · compliance said plainly · operator vocabulary (resto, adresse, rush, trio, en service, en sus) · no testimonials, no stats, no awards unless real and sourced.

---

## ROUTE MAP

| Route (FR, default) | Route (EN mirror) | Page |
|---|---|---|
| `/` | `/en` | Home |
| `/tarifs` | `/en/pricing` | Pricing |
| `/diagnostic` | `/en/diagnostic` | Free diagnostic (Supabase lead form) |
| `/confidentialite` | `/en/privacy` | Privacy |
| `/conditions` | `/en/terms` | Terms |
| `/sitemap.xml`, `/robots.txt` | same | Generated routes |
| 404 (FR) | — | Not found |

Language switcher in header: FR | EN. French is default and at root (Law 25 / Quebec French primacy). No preloader/boot gate (Act 0 skipped for speed + Lighthouse); igloo discipline kept.

---

# PAGE 1 — HOME `/` (EN: `/en`)

## Nav (fixed)
- FR: Plateforme · Conformité · Tarifs · Diagnostic gratuit · FR/EN toggle
- EN: Platform · Compliance · Pricing · Free diagnostic · EN/FR toggle
- Wordmark: RESTOBOOM. — tagline (small): Fait au Québec. / Made in Québec.

## S1 — Hero (deck Act 1, reused verbatim)
- Kicker — FR: Plateforme de croissance pour restaurants du Québec · EN: The growth platform for Québec restaurants
- H1 — FR: « Le resto qui répond à tout. » · EN: "The restaurant that answers everything."
- Body — FR: « Appels manqués, textos, avis, relances : RestoBoom répond à chaque client, en français d'abord. Votre équipe reste en service. »
  EN: "Missed calls, texts, reviews, follow-ups: RestoBoom answers every guest, in French first. Your team stays in service."
- CTA primary — FR: Réserver une démo · EN: Book a demo → `/diagnostic`
- CTA secondary — FR: Voir la plateforme · EN: See the platform → `/#plateforme`
- Meta strip — FR: Conçu et hébergé au Canada · LCAP et Loi 25 par conception · Facturé en dollars canadiens
  EN: Built and hosted in Canada · CASL and Law 25 by design · Priced in CAD

## S2 — Pain points (deck Act 2 scene + qualitative pains, no stats)
- Kicker — FR: Le problème · EN: The problem
- Display — FR: « 12 h 15. » · EN: "12:15."
- Body — FR: « Le téléphone sonne en plein rush. Personne ne peut décrocher. À 12 h 16, le trio commande ailleurs. »
  EN: "The phone rings mid-rush. Nobody can pick up. At 12:16, the order goes somewhere else."
- Resolve (accent line) — FR: « RestoBoom envoie un texto en **15 secondes**. Avec le lien pour commander. »
  EN: "RestoBoom texts back in **15 seconds**. With the link to order."
- Pain list (H3s, FR / EN):
  1. « Le téléphone, c'est le rush. » / "The phone is the rush." — « Chaque appel manqué pendant le service est une commande qui part chez le voisin. » / "Every missed call during service is an order that goes to the place next door."
  2. « Les avis attendent. » / "Reviews wait." — « Un avis sans réponse, c'est un client qui parle dans le vide. Vous y répondrez après le service — peut-être. » / "An unanswered review is a guest talking into the void. You'll answer after service — maybe."
  3. « Les relances ne partent jamais. » / "Follow-ups never send." — « Les habitués qu'on n'a pas vus depuis 60 jours, personne n'a le temps de les rappeler un par un. » / "Regulars you haven't seen in 60 days — nobody has time to call them one by one."
  4. « Les habitués sont des inconnus. » / "Regulars are strangers." — « Vos données de caisse savent qui dépense et qui disparaît. Rien n'en sort. » / "Your POS data knows who spends and who disappears. Nothing comes of it."

## S3 — Platform (deck Act 3, id `#plateforme`; 4 sub-blocks)
### 01 — La réception / The front desk
- H3 — FR: « La réception qui ne ferme jamais. » · EN: "A front desk that never closes."
- Body — FR: « Texto, courriel, Messenger, Instagram, clavardage : toutes les conversations dans une seule boîte, par adresse. Appel manqué ? Réponse texte en 15 secondes, dans la langue du client. La réception automatisée répond aux heures, à l'adresse, au menu — jour et nuit. Elle se présente comme automatisée, d'entrée de jeu. »
  EN: "SMS, email, Messenger, Instagram, web chat: every conversation in one inbox per location. Missed call? A text goes back in 15 seconds, in the guest's language. The automated front desk answers hours, address and menu questions, day and night. It says it's automated, first thing."
- Specs — FR: Réponse aux appels manqués en 15 s · 5 canaux, une boîte · « ARRET » respecté à la lettre
  EN: Missed-call reply in 15 s · 5 channels, one inbox · "STOP" respected to the letter

### 02 — Les avis / Reviews
- H3 — FR: « Chaque avis mérite une réponse. » · EN: "Every review deserves an answer."
- Body — FR: « Après la commande, RestoBoom demande l'avis. Chaque client reçoit le lien Google, peu importe la note. Un avis serré ? Le gérant est alerté, la conversation reste privée. Une réponse à publier ? L'ébauche est rédigée, vous approuvez. »
  EN: "After the order, RestoBoom asks for the review. Every guest gets the Google link, whatever the rating. A rough one? The manager is alerted and the conversation stays private. A reply to post? The draft is written; you approve it."
- Specs — FR: Demande d'avis après commande · Réponses suggérées, vous approuvez · Aucun filtrage d'avis
  EN: Review request after each order · Suggested replies, you approve · No review gating

### 03 — Les relances / Follow-ups
- H3 — FR: « Les relances partent seules. Au bon moment. » · EN: "Follow-ups send themselves. At the right time."
- Body — FR: « Souper d'équipe, anniversaire, client absent depuis 60 jours : des séquences qui partent au bon moment, dans les heures permises, et s'arrêtent net dès que le client écrit « ARRET ». »
  EN: "Staff night, birthday, a guest absent for 60 days: sequences that send at the right moment, inside permitted hours, and stop the instant a guest texts STOP."
- Specs — FR: Heures de paix 21 h à 9 h · Désabonnement immédiat · Consentement vérifié avant chaque envoi
  EN: Quiet hours 9 pm to 9 am · Instant unsubscribe · Consent checked before every send

### 04 — Les habitués / Regulars
- H3 — FR: « Connaissez vos habitués comme un serveur de quartier. » · EN: "Know your regulars like a neighbourhood server does."
- Body — FR: « Dépense à vie, dernière visite, étiquettes : chaque client a une fiche, alimentée par vos données de caisse. Et des listes qui trouvent les VIP partis depuis 30 jours en une recherche. »
  EN: "Lifetime spend, last visit, tags: every guest has a profile, fed by your POS data. And lists that find VIPs gone 30 days in one search."
- Specs — FR: Importation CSV dès le premier jour · Profils alimentés par la caisse · Listes intelligentes
  EN: CSV import from day one · Profiles fed by your POS · Smart lists

## S4 — How it works (NEW, 3 steps)
- Kicker — FR: Comment ça marche · EN: How it works
- H2 — FR: « Trois étapes. Puis le service continue. » · EN: "Three steps. Then service carries on."
1. FR: « On branche. » — « Votre numéro reste le même. On connecte vos canaux et on importe vos clients par CSV, dès le premier jour. »
   EN: "We connect." — "Your number stays the same. We hook up your channels and import your guests by CSV, from day one."
2. FR: « RestoBoom répond. » — « Appel manqué pendant le rush ? Réponse texto en 15 secondes. La réception automatisée couvre les heures, l'adresse, le menu — jour et nuit. »
   EN: "RestoBoom answers." — "Missed call mid-rush? A text goes back in 15 seconds. The automated front desk covers hours, address, menu — day and night."
3. FR: « Vous approuvez. » — « Avis et relances : les ébauches sont rédigées, vous approuvez avant que ça parte. Le consentement est vérifié, les heures de paix respectées, 21 h à 9 h. »
   EN: "You approve." — "Reviews and follow-ups: drafts are written, you approve before anything sends. Consent checked, quiet hours respected, 9 pm to 9 am."

## S5 — Compliance (deck Act 4, id `#conformite`)
- H2 — FR: « Conforme par conception. » · EN: "Compliant by design."
- Body — FR: « Vos données et celles de vos clients restent au Canada. Aucun envoi sans consentement, et le désabonnement est immédiat : STOP, ARRET, peu importe le mot. Les droits prévus par la Loi 25 — accès, rectification, suppression — sont des fonctions du produit, pas une promesse en petits caractères. »
  EN: "Your data and your guests' data stay in Canada. No send without consent, and unsubscribing is instant: STOP, ARRET, either word. Law 25 rights — access, correction, deletion — are product features, not fine print."
- Fact rows:
  - FR: Données au Canada / Hébergement canadien, flux tiers listés · EN: Data in Canada / Canadian hosting, third-party flows listed
  - FR: LCAP / CASL · Consentement tracé avant chaque envoi · EN: CASL · Consent logged before every send
  - FR: Loi 25 / Law 25 · Accès, correction, suppression : intégrés · EN: Law 25 · Access, correction, deletion: built in

## S6 — Sample outputs (NEW; illustrative, clearly labelled)
- Kicker — FR: Exemples · EN: Examples
- H2 — FR: « Ce que RestoBoom écrit pour vous. » · EN: "What RestoBoom writes for you."
- Card 1 — label FR: Après un appel manqué · SMS · EN: After a missed call · SMS
  FR: « Bonsoir ! Désolé d'avoir manqué votre appel — le menu et la commande en ligne sont ici : [lien]. Répondez ARRET pour ne plus recevoir de messages. »
  EN: "Hi! Sorry we missed your call — the menu and online ordering are right here: [link]. Reply STOP and you won't hear from us again."
- Card 2 — label FR: Ébauche de réponse à un avis Google (2 étoiles) · EN: Draft reply to a Google review (2 stars)
  FR: « Merci d'avoir pris le temps de nous écrire, et désolé que ce soir-là n'ait pas été à la hauteur. Ce n'est pas notre standard. J'aimerais en parler — passez au resto ou écrivez-moi directement. — [Prénom], gérant »
  EN: "Thanks for taking the time to write, and sorry that night wasn't up to standard. It isn't ours either. I'd like to make it right — drop by or write me directly. — [First name], manager"
- Card 3 — label FR: Relance — client absent depuis 60 jours · EN: Follow-up — guest absent 60 days
  FR: « Bonsoir [Prénom] ! Ça fait un bout. Votre table vous attend — ce samedi, le trio est de retour : [lien] »
  EN: "Evening, [First name]! It's been a while. Your table's waiting — this Saturday the trio is back: [link]"
- Caption — FR: « Exemples illustratifs, aucun message réel. Les ébauches partent seulement après votre approbation. »
  EN: "Illustrative examples, no real messages. Drafts send only after your approval."

## S7 — Pricing summary (deck Act 5, compact) → full table on /tarifs
- Kicker — FR: Tarifs · EN: Pricing
- H2 — FR: « Trois tarifs. En dollars canadiens. » · EN: "Three plans. In Canadian dollars."
- Table: Solo 149 $/mois (une adresse) · Multi 449 $/mois (jusqu'à 5 adresses) · Franchise 1 299 $/mois (votre réseau, votre marque)
- Fine print — FR: Facturation mensuelle en CAD. TPS et TVQ en sus. Textos inclus par palier; surplus facturés au segment.
  EN: Billed monthly in CAD. GST and QST extra. SMS included by tier; overage billed per segment.
- CTA — FR: Voir les tarifs · EN: See pricing → `/tarifs`

## S8 — FAQ (home subset, 5 questions)
- Kicker — FR: Questions · EN: Questions
- H2 — FR: « Les questions qu'on nous pose. » · EN: "What people ask us."
1. Q FR: « L'automatisation se cache-t-elle ? » A FR: « Non. Elle se présente comme automatisée, d'entrée de jeu. »
   EN: "Does the automation hide itself?" / "No. It says it's automated, first thing."
2. Q FR: « Où sont hébergées mes données ? » A FR: « Au Canada. Hébergement canadien, flux tiers listés. »
   EN: "Where is my data hosted?" / "In Canada. Canadian hosting, third-party flows listed."
3. Q FR: « Et le consentement pour les textos ? » A FR: « Aucun envoi sans consentement vérifié. STOP ou ARRET, et c'est immédiat. Heures de paix : 21 h à 9 h. »
   EN: "What about texting consent?" / "No send without verified consent. STOP or ARRET, and it's instant. Quiet hours: 9 pm to 9 am."
4. Q FR: « Filtrez-vous les avis Google ? » A FR: « Non. Chaque client reçoit le lien Google, peu importe la note. »
   EN: "Do you filter Google reviews?" / "No. Every guest gets the Google link, whatever the rating."
5. Q FR: « Qui approuve ce qui part ? » A FR: « Vous. Les réponses aux avis et les relances restent des ébauches jusqu'à votre approbation. »
   EN: "Who approves what goes out?" / "You. Review replies and follow-ups stay drafts until you approve them."

## S9 — Closer (deck Act 6)
- H2 — FR: « Votre prochain appel manqué devient une commande. » · EN: "Your next missed call becomes an order."
- Sub — FR: « 30 minutes. Vos vrais scénarios. Pas de diapositives. » · EN: "30 minutes. Your real scenarios. No slide deck."
- CTA — FR: Réserver une démo · EN: Book a demo → `/diagnostic`

## Footer
- FR: RESTOBOOM. — Fait au Québec. — © 2026 · EN: RESTOBOOM. — Made in Québec. — © 2026
- Links FR: Plateforme · Conformité · Tarifs · Diagnostic gratuit · Confidentialité · Conditions · bonjour@restoboom.ca (PLACEHOLDER email)
- Links EN: Platform · Compliance · Pricing · Free diagnostic · Privacy · Terms

---

# PAGE 2 — PRICING `/tarifs` (EN: `/en/pricing`)

- SEO title FR: Tarifs — RestoBoom · EN: Pricing — RestoBoom
- SEO description FR: Trois tarifs pour restaurants du Québec : Solo 149 $, Multi 449 $, Franchise 1 299 $ par mois, en CAD. TPS et TVQ en sus.
  EN: Three plans for Québec restaurants: Solo $149, Multi $449, Franchise $1,299 a month, in CAD. GST and QST extra.

- H1 — FR: « Trois tarifs. En dollars canadiens. » · EN: "Three plans. In Canadian dollars."
- Intro — FR: « Le prix du plan suit vos adresses, pas vos fonctionnalités. Toutes les fonctions — réception, avis, relances, habitués — sont incluses partout. »
  EN: "The plan follows your locations, not your feature list. Every function — front desk, reviews, follow-ups, regulars — is included everywhere."

Tier table (columns: Solo / Multi / Franchise):
- Row prix — FR: 149 $/mois · 449 $/mois · 1 299 $/mois (+ installation : 499 $ · 1 499 $ · 4 999 $)
  EN: $149/mo · $449/mo · $1,299/mo (setup: $499 · $1,499 · $4,999)
- Row adresses — FR: Une adresse · Jusqu'à 5 adresses · Votre réseau, votre marque
  EN: One location · Up to 5 locations · Your network, your brand
- Row inclus (all three, FR: « Inclus dans les trois tarifs » / EN: "Included in all plans"):
  Réception 5 canaux, une boîte par adresse · Réponse aux appels manqués en 15 s · Réception automatisée jour et nuit, qui se présente comme automatisée · Demande d'avis après commande, sans filtrage · Réponses suggérées, vous approuvez · Relances avec heures de paix 21 h–9 h · Fiches clients alimentées par la caisse, importation CSV · Données au Canada, droits Loi 25 intégrés
  EN: 5-channel inbox, one per location · Missed-call reply in 15 s · Automated front desk day and night, disclosed as automated · Review request after every order, no gating · Suggested replies, you approve · Follow-ups with 9 pm–9 am quiet hours · Guest profiles fed by POS, CSV import · Data in Canada, Law 25 rights built in
- CTA per column — FR: Parler à un humain · EN: Talk to a human → `/diagnostic`

Fine print — FR: « Facturation mensuelle en CAD. TPS et TVQ en sus. Frais d'installation ponctuels, par adresse réseau pour Franchise. Textos inclus par palier; surplus facturés au segment. »
EN: "Billed monthly in CAD. GST and QST extra. One-time setup fees; per-network-location for Franchise. SMS included by tier; overage billed per segment."

Pricing FAQ (4):
1. Q FR: « Les frais d'installation, c'est quoi ? » A FR: « Le branchement de vos canaux, l'importation de vos clients et la configuration de vos scénarios, faits avec vous. Ponctuels. »
   EN: "What are setup fees?" / "Connecting your channels, importing your guests and configuring your scenarios, done with you. One-time."
2. Q FR: « Qu'est-ce qu'une « adresse » ? » A FR: « Un établissement avec son numéro et sa boîte. Un resto, une adresse. »
   EN: "What's a 'location'?" / "A premises with its own number and inbox. One resto, one location."
3. Q FR: « Combien de textos sont inclus ? » A FR: « Les textos sont inclus par palier, les surplus facturés au segment. On regarde votre volume réel ensemble avant de choisir. »
   EN: "How many texts are included?" / "SMS is included by tier, overage billed per segment. We look at your real volume together before you pick."
4. Q FR: « Je peux arrêter quand ? » A FR: « La facturation est mensuelle. Les conditions de résiliation sont dans les Conditions. » [PLACEHOLDER — confirm cancellation policy]
   EN: "Can I stop anytime?" / "Billing is monthly. Cancellation terms are in the Terms." [PLACEHOLDER — confirm cancellation policy]
- CTA final — FR: « Pas sûr ? Parlez à un humain. » · EN: "Not sure? Talk to a human." → `/diagnostic`

---

# PAGE 3 — FREE DIAGNOSTIC `/diagnostic` (EN: `/en/diagnostic`)

- SEO title FR: Diagnostic gratuit — RestoBoom · EN: Free diagnostic — RestoBoom
- SEO description FR: Diagnostic gratuit de votre présence en ligne : fiche Google, menu, avis. 30 minutes, vos vrais scénarios, pas de diapositives.
  EN: Free diagnostic of your online presence: Google profile, menu, reviews. 30 minutes, your real scenarios, no slide deck.

- Kicker — FR: Diagnostic gratuit · EN: Free diagnostic
- H1 — FR: « Votre resto en ligne, passé au peigne. » · EN: "Your resto online, gone over properly."
- Body — FR: « Remplissez le formulaire. On regarde votre fiche Google, votre menu en ligne et vos avis. Puis on vous rappelle : trois constats concrets, 30 minutes, pas de diapositives. »
  EN: "Fill in the form. We look at your Google profile, your online menu and your reviews. Then we call you back: three concrete findings, 30 minutes, no slide deck."
- Reassurance line — FR: « Gratuit. Sans engagement. On vous écrit sous 2 jours ouvrables. » [PLACEHOLDER — confirm SLA]
  EN: "Free. No commitment. We write back within 2 business days." [PLACEHOLDER — confirm SLA]

Form (labels FR / placeholder EN mirror):
- Nom complet / Full name — input, required
- Courriel / Email — input type email, required
- Nom du restaurant / Restaurant name — input, required
- Site web ou fiche Google (URL) / Website or Google profile (URL) — input, optional
- Consent checkbox (required) — FR: « J'accepte d'être contacté au sujet de ma demande. Désabonnement en tout temps. » + link « Confidentialité »
  EN: "I agree to be contacted about my request. Unsubscribe anytime." + Privacy link
- Submit — FR: Envoyer ma demande · EN: Send my request
- Honeypot field (hidden) + server-side rate limit; on success insert row into Supabase `diagnostic_leads`, then show inline confirmation.
- Success state — FR: « Merci ! Votre demande est bien reçue. On vous écrit dans les 2 jours ouvrables. » · EN: "Thanks! Your request is in. We'll write within 2 business days."
- Error state — FR: « Quelque chose n'a pas marché. Réessayez ou écrivez à [PLACEHOLDER email]. » · EN: "Something went wrong. Try again or write to [PLACEHOLDER email]."
- Below form — FR: « Vos données restent au Canada. Elles servent à répondre à votre demande, rien d'autre. » + link Confidentialité
  EN: "Your data stays in Canada. It's used to answer your request, nothing else." + Privacy link

---

# PAGE 4 — PRIVACY `/confidentialite` (EN: `/en/privacy`) — DRAFT, needs legal review

SEO title FR: Confidentialité — RestoBoom · EN: Privacy — RestoBoom

FR full text:
1. Qui nous sommes — « RestoBoom est exploitée par [PLACEHOLDER — entité légale], au Québec. »
2. Données que nous recueillons — « Via le formulaire de diagnostic : votre nom, votre courriel, le nom de votre restaurant et l'adresse de votre site ou fiche Google. Via le service : les données clients que vous importez ou connectez (fiches clients, conversations, avis, consentements). Des données techniques minimes (journaux) pour la sécurité et le fonctionnement. »
3. Pourquoi — « Répondre à vos demandes. Fournir, maintenir et améliorer le service. Facturer. Aucune vente de données. Aucune publicité. »
4. Où — « Au Canada. Hébergement canadien; les flux vers des tiers (ex. envoi de textos, traitement d'avis) sont listés dans notre document sous-traitants, disponible sur demande. » [PLACEHOLDER — link/attach subprocessor list]
5. Combien de temps — « Les demandes de diagnostic : [PLACEHOLDER — période, p. ex. 24 mois]. Les données du service : pendant votre abonnement, puis [PLACEHOLDER — période] pour vous permettre de les exporter ou de les supprimer. »
6. Vos droits (Loi 25) — « Accès, rectification, suppression, portabilité : écrivez à [PLACEHOLDER email]. On répond dans les 30 jours. Ces droits sont aussi des fonctions du produit. »
7. Textos et LCAP — « Aucun envoi commercial sans consentement. STOP ou ARRET, et c'est immédiat. Heures de paix : 21 h à 9 h. »
8. Cookies — « Ce site marketing n'utilise aucun traceur publicitaire et ne vend aucune donnée. »
9. Modifications — « On publiera toute modification ici, avec sa date. »
10. Contact — « [PLACEHOLDER — entité légale], [PLACEHOLDER adresse], bonjour@restoboom.ca (PLACEHOLDER). »
Note: [À FAIRE VALIDER PAR UN JURISTE AVANT LANCEMENT.]

EN mirror: full translation included in build; same 10 sections, same placeholders.

---

# PAGE 5 — TERMS `/conditions` (EN: `/en/terms`) — DRAFT, needs legal review

SEO title FR: Conditions — RestoBoom · EN: Terms — RestoBoom

FR full text:
1. Objet — « Les présentes conditions régissent l'utilisation du site restoboom.ca (PLACEHOLDER — domaine) et du service RestoBoom : plateforme de croissance pour restaurants (réception, avis, relances, habitués). »
2. Le service — « RestoBoom répond aux clients par texto, courriel, Messenger, Instagram et clavardage, demande les avis après commande, suggère des réponses et des relances, et tient les fiches clients. Les ébauches d'avis et de relances ne partent qu'après votre approbation. La réception automatisée se présente comme automatisée. »
3. Tarifs et facturation — « Facturation mensuelle en dollars canadiens. TPS et TVQ en sus. Frais d'installation ponctuels selon le tarif choisi. Textos inclus par palier; surplus facturés au segment. »
4. Résiliation — « [PLACEHOLDER — politique de résiliation à confirmer : préavis, remboursement au prorata ou non]. »
5. Consentements — « Vous êtes responsable d'obtenir le consentement requis pour contacter vos clients (LCAP). Le service vérifie et trace le consentement avant chaque envoi et respecte immédiatement STOP et ARRET. »
6. Vos données — « Vos données et celles de vos clients restent les vôtres. Hébergement au Canada. Droits d'accès, de rectification et de suppression intégrés au produit (Loi 25). »
7. Utilisation acceptable — « Pas d'envoi sans consentement, pas de contenus illégaux, pas de contournement des heures de paix ou des désabonnements. »
8. Responsabilité — « Le service est fourni avec diligence, sans garantie de résultats commerciaux (commandes, avis, revenus). Rien ici ne limite ce qui ne peut l'être par la loi. » [À FAIRE VALIDER.]
9. Droit applicable — « Les présentes conditions sont régies par les lois du Québec et du Canada. Tout litige relève des tribunaux du district judiciaire de [PLACEHOLDER — Laval]. »
10. Contact — « [PLACEHOLDER — entité légale], bonjour@restoboom.ca (PLACEHOLDER). Dernière mise à jour : [PLACEHOLDER — date]. »
Note: [À FAIRE VALIDER PAR UN JURISTE AVANT LANCEMENT.]

EN mirror: full translation included in build; same 10 sections, same placeholders.

---

# 404 PAGE
- FR: « Cette page a changé d'adresse. » + CTA « Retour à l'accueil » → `/` · EN: "This page moved." + "Back to home" → `/en`

# SEO / social meta
- FR home title: RestoBoom — Le resto qui répond à tout.
- FR home description: Appels manqués, textos, avis et relances pour restaurants du Québec. Une plateforme, en français d'abord, conforme LCAP et Loi 25, facturée en CAD.
- EN home title: RestoBoom — The restaurant that answers everything.
- EN home description: Missed calls, texts, reviews and follow-ups for Québec restaurants. One platform, French first, CASL and Law 25 compliant, priced in CAD.
- OG image: [PLACEHOLDER — generate 1200×630 og.jpg, wordmark + hero line, before launch]

# CLAIM REGISTER (every factual claim → source)
| Claim | Source |
|---|---|
| Text back in 15 seconds | restoboom-v2/docs/SPEC.md, Module C |
| 5 channels, one inbox per location | SPEC.md Module C |
| Automated front desk discloses itself | SPEC.md Module G |
| Every guest gets the Google link, no gating | SPEC.md Module E |
| Suggested replies need approval | SPEC.md Module E |
| STOP/ARRET instant unsubscribe | SPEC.md §8 CASL |
| Quiet hours 21:00–09:00 | SPEC.md §8 |
| Data stays in Canada | SPEC.md §8 + docs/adr/002 |
| Law 25 rights as product features | SPEC.md §8 |
| Prices 149/449/1 299 $ CAD + setup | bot-fleet/pricing-memo.md §2 (2026-10-12) |
| TPS/TVQ extra, billed in CAD | SPEC.md §8 |
| CSV import day one, POS-fed profiles | restoboom-site-copy.md Act 3.04 (from SPEC) |
| Built and hosted in Canada | SPEC.md §8 + ADR 002 |

# PLACEHOLDERS TO RESOLVE BEFORE LAUNCH
1. Legal entity (privacy + terms) — RestoBoom operator. NOTE: 6337902 Canada Inc. is the Bellepros entity; do NOT publish it for RestoBoom unless the user confirms it is the operator.
2. Contact email — bonjour@restoboom.ca assumed; confirm inbox exists.
3. Domain — restoboom.ca assumed, not verified.
4. Diagnostic response SLA — « 2 jours ouvrables » is an operational choice.
5. Cancellation policy — terms §4 needs the real policy.
6. Supported POS list — claimed only as « données de caisse » generally + CSV; do not name POS brands without verification.
7. Subprocessor list document — referenced on request; must exist.
8. Retention periods — privacy §5.
9. OG image — to generate.
10. Judicial district — Laval assumed in terms §9.
11. No testimonials, no stats, no awards anywhere — add only real, verifiable ones.

# BUILD NOTES (for Step 3)
- Next.js App Router + Tailwind, deploy to Vercel. No middleware; FR at `/`, EN under `/en/` with a shared `dictionary.ts` per locale.
- Diagnostic form → Route Handler `/api/diagnostic` (server-side) → Supabase insert (service-role key from env, never client-side) → honeypot + rate limit per IP.
- Env: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_CONTACT_EMAIL. Ship `.env.example` with placeholders only.
- Accessibility: WCAG AA — semantic landmarks, one h1/page, visible focus, 4.5:1 contrast, `details/summary` FAQ, labels tied to inputs, `aria-live` on form status.
- Speed: static pages everywhere except the diagnostic route handler; no analytics by default (privacy §8); system-adjacent font stack or one self-hosted variable font; no preloader.
