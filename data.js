/* ChaloYaar — curated Bengaluru routes. Hand-verified, honest flags. */
window.CHALO_ROUTES = [
  {
    id: "nandi-hills-sunrise",
    name: "Nandi Hills Sunrise",
    tagline: "wake up at 4, cry at the view, chai at 7 — classic bangalore arc",
    budget: "quick",
    modes: ["bike", "car", "public"],
    distance_km: 120,
    ride_time: "~2.5–3 hrs round trip",
    best_time: "reach by 5:15–5:30 AM for sunrise; weekdays quieter",
    cost: "~₹80–150 (parking + chai + tip)",
    vibe: ["sunrise", "crowd-classic", "chai"],
    why: "It's the OG Bengaluru escape for a reason — cold air, pink sky, and a city that actually looks peaceful from up there. Go once properly (early, weekday) and you'll get why people gatekeep the timing.",
    facts: [
      "Nandi Hills sits ~1,478m; mornings can be 8–12°C cooler than the city.",
      "Tipu's Drop and the yoga peak are the usual selfie magnets — both get packed by 6:30 AM on weekends.",
      "The hill fort history goes back to the Cholas and later Tipu Sultan's era.",
      "Fog season (Nov–Jan) can hide the sunrise entirely — still worth the drive for the vibe."
    ],
    stops: [
      { km: 0, name: "Yelahanka / Hebbal exit", note: "fuel up before leaving the city" },
      { km: 45, name: "Nandi foothill gate", note: "usually opens ~5–6 AM; follow queue rules" },
      { km: 60, name: "Summit / Tipu's Drop", note: "walk carefully near edges" },
      { km: 60, name: "Chai stalls", note: "overpriced and perfect" }
    ],
    flags: [
      "Night driving on NH and hill roads — mist + sleepy truckers. Go slow.",
      "Cliff edges have no forgiveness. No selfies on barriers.",
      "Weekend parking chaos after 6 AM — expect delays and blocked lanes.",
      "Alcohol checkpoints appear randomly near the foothills."
    ],
    mode_tips: {
      bike: [
        "Layer up — summit wind cuts hard before sunrise.",
        "Watch for oil patches on the climb after light rain.",
        "Don't stop mid-hairpin for photos; pull into proper cutouts."
      ],
      car: [
        "Carpool if you can — parking fills viciously on Saturdays.",
        "Keep low beam in fog; high beam just whites out mist.",
        "Leave by 4–4:15 AM from south Bangalore to beat the convoy."
      ],
      public: [
        "KSRTC / private buses toward Chikkaballapur; last-mile auto/shared cab to gate.",
        "Sunrise by bus is hard — plan a day visit instead, or cab-share from Yelahanka.",
        "Return buses thin out mid-afternoon; check last service before you climb."
      ]
    },
    season: { best: "Oct–Feb (clear skies, cold mornings)", avoid: "Jun–Sep heavy mist/rain on climb" },
    transit: "Doable as a day trip via bus to Chikkaballapur (~₹60–100) + auto/cab to Nandi (~₹300–500 one way shared). Sunrise timing is impractical on public alone — start early or join a shared cab from the city.",
    origin: "Bengaluru",
    dest: "Nandi Hills, Karnataka",
    destq: "Nandi%20Hills%2C%20Karnataka",
    dlat: 13.3702,
    dlng: 77.6835,
    waypoints: []
  },
  {
    id: "big-banyan-manchanabele",
    name: "Big Banyan + Manchanabele",
    tagline: "giant tree energy then dam breeze — south bangalore's chill loop",
    budget: "quick",
    modes: ["bike", "car"],
    distance_km: 70,
    ride_time: "~2–3 hrs with stops",
    best_time: "late afternoon → golden hour at the dam",
    cost: "~₹100–200 (snacks + parking)",
    vibe: ["trees", "dam", "golden-hour"],
    why: "Short, pretty, and low-commitment. The Big Banyan is a living meme of a tree, and Manchanabele gives you wind + water without a full-day commitment. Perfect when you have 3 hours and zero plans.",
    facts: [
      "The Dodda Alada Mara (Big Banyan) canopy spans roughly an acre — it's actually many aerial-root trunks.",
      "Manchanabele dam feeds local irrigation; the viewpoint roads get busy on Sundays.",
      "Kumbalgod–Mysore Road corridor is the usual approach from west Bangalore.",
      "Sunset reflections on the reservoir hit different Nov–Feb."
    ],
    stops: [
      { km: 0, name: "Kengeri / RR Nagar exit", note: "fuel + water" },
      { km: 18, name: "Big Banyan (Dodda Alada Mara)", note: "10–20 min walk under the canopy" },
      { km: 35, name: "Manchanabele viewpoint", note: "don't cross barriers toward water" }
    ],
    flags: [
      "No swimming / no walking on dam walls — currents and drop-offs are real.",
      "Narrow village roads after Big Banyan; expect cattle and schoolkids.",
      "Weekend evenings get crowded; park only in designated spots.",
      "Phone signal dips near the reservoir — tell someone your ETA."
    ],
    mode_tips: {
      bike: [
        "Great beginner loop — smoothish roads, short distances.",
        "Gravel near some viewpoints; keep speeds chill.",
        "Carry a light if you'll leave after sunset."
      ],
      car: [
        "Easy Sunday drive; watch for sudden speed breakers near villages.",
        "Bring a thermos — picnic energy is strong here.",
        "Avoid blocking farm access roads when parking."
      ],
      public: [
        "Sparse last-mile options; BMTC toward Kumbalgod then auto — awkward for first-timers.",
        "Better as a bike/car hop; public is possible but slow for a 'quick' budget."
      ]
    },
    season: { best: "Oct–Mar evenings", avoid: "peak monsoon (muddy access tracks)" },
    transit: "Impractical as a clean public-only loop. BMTC toward Kengeri/Kumbalgod + autos can get you to Big Banyan, but Manchanabele last-mile is unreliable. Prefer bike/car or a shared cab.",
    origin: "Bengaluru",
    dest: "Manchanabele Dam, Karnataka",
    destq: "Manchanabele%20Dam%2C%20Karnataka",
    dlat: 12.8706,
    dlng: 77.3928,
    waypoints: ["Dodda Alada Mara Big Banyan Tree"]
  },
  {
    id: "ramanagara-sholay-rocks",
    name: "Ramanagara Sholay Rocks",
    tagline: "gabbar's backyard — scramble, scream, snack, scoot home",
    budget: "quick",
    modes: ["bike", "car", "public"],
    distance_km: 110,
    ride_time: "~2.5–3.5 hrs round trip",
    best_time: "morning before heat (7–10 AM) or late afternoon",
    cost: "~₹100–250 (entry/parking varies + snacks)",
    vibe: ["rocks", "bollywood", "scramble"],
    why: "Ramanagara's boulder hills are the Sholay filming lore playground. Short drive, big views, and just enough scramble to feel like you did something with your day.",
    facts: [
      "Ramadevara Betta and nearby hills were used in Sholay's outdoor sequences.",
      "Ramanagara is also a major silk town — look for local silk shops if you're into that.",
      "The hillock scramble is steeper than it looks from the parking lot.",
      "Weekday mornings are dramatically quieter than Sunday afternoons."
    ],
    stops: [
      { km: 0, name: "Nice Road / Mysore Rd exit", note: "fuel before the highway stretch" },
      { km: 50, name: "Ramanagara town", note: "water + shade" },
      { km: 55, name: "Ramadevara Betta / Sholay rocks area", note: "wear shoes with grip" }
    ],
    flags: [
      "Loose rock + heat = twisted ankles. Proper shoes, not slippers.",
      "No climbing after dark; trails aren't lit.",
      "Monolith / hill scramble in rain is slippery and dumb — skip if wet.",
      "Respect temple areas and local rules around Ramadevara Betta."
    ],
    mode_tips: {
      bike: [
        "Mysore Road traffic is chaotic near city exit — stay lane-disciplined.",
        "Hydrate; granite radiates heat by noon.",
        "Lock helmets; don't leave valuables in open view."
      ],
      car: [
        "Easy highway run; watch for sudden U-turns near town.",
        "Park in official lots — random roadside parking gets ticketed.",
        "Great for mixed groups who don't want a long trek day."
      ],
      public: [
        "Frequent trains/buses Bengaluru → Ramanagara (~1–1.5 hrs).",
        "From station, auto to Ramadevara Betta area (~₹150–250).",
        "Return trains are frequent till evening — check IRCTC / station board."
      ]
    },
    season: { best: "Nov–Feb mornings", avoid: "Apr–May midday heat; rainy scramble days" },
    transit: "One of the better public options near Bengaluru. Train or KSRTC/private bus to Ramanagara (~₹40–80), then auto to the hills. Round-trip public cost often ~₹200–400 pp depending on auto.",
    origin: "Bengaluru",
    dest: "Ramadevara Betta, Ramanagara",
    destq: "Ramadevara%20Betta%2C%20Ramanagara",
    dlat: 12.7253,
    dlng: 77.2805,
    waypoints: []
  },
  {
    id: "skandagiri-night-trek",
    name: "Skandagiri Night Trek",
    tagline: "walk up in the dark, watch the sun bully the fog — legs will file a complaint",
    budget: "quick",
    modes: ["bike", "car"],
    distance_km: 100,
    ride_time: "~2 hrs drive + 3–4 hrs trek",
    best_time: "start trek ~2–3 AM with a permitted guide group",
    cost: "~₹500–900 (guide/permit + parking + snacks; varies)",
    vibe: ["night-trek", "sunrise", "legs-day"],
    why: "Skandagiri (Kalavara Durga) is the classic night trek for Bengaluru folks who want sunrise without Nandi's parking circus. It's a proper climb — treat it like a trek, not a stroll.",
    facts: [
      "Skandagiri is an ancient fort hill near Chikkaballapur.",
      "Night treks are often regulated — go with permitted operators, not random WhatsApp groups.",
      "Summit views can sit above a cloud layer in winter.",
      "Descent in daylight is safer; save ankles by not rushing."
    ],
    stops: [
      { km: 0, name: "Airport Road / NH44 north", note: "fuel + headlamp batteries" },
      { km: 50, name: "Base village / trek start", note: "meet guide; carry water (2L+)" },
      { km: 50, name: "Summit fort ruins", note: "sunrise; pack out ALL trash" }
    ],
    flags: [
      "Unauthorized night treks have been cracked down on — use legitimate permits/guides.",
      "Steep, rocky, and dark. Headlamp is non-negotiable.",
      "Don't trek solo at night. Seriously.",
      "Rain makes rock faces lethal — cancel if wet."
    ],
    mode_tips: {
      bike: [
        "Night ride to base needs high-vis and sober focus.",
        "Secure bike well; base gets busy with trek groups.",
        "Carry a light jacket — summit wind before sunrise is cold."
      ],
      car: [
        "Best for groups sharing guide costs.",
        "Arrive early to park without drama.",
        "Someone should stay awake for the drive back — sunrise naps hit hard."
      ],
      public: [
        "Hard to time for a 2 AM start. Cab-share or private vehicle is realistic.",
        "Day trek variants exist if you refuse night logistics."
      ]
    },
    season: { best: "Nov–Feb (clear sunrise)", avoid: "monsoon night treks" },
    transit: "Public transport doesn't align well with 2 AM starts. Shared cabs from Bengaluru with a trek operator is the usual pattern. Day hikes are more transit-friendly via Chikkaballapur buses + last-mile auto.",
    origin: "Bengaluru",
    dest: "Skandagiri, Karnataka",
    destq: "Skandagiri%20Kalavara%20Durga%2C%20Karnataka",
    dlat: 13.4181,
    dlng: 77.6794,
    waypoints: []
  },
  {
    id: "savandurga-loop",
    name: "Savandurga Loop",
    tagline: "asia's biggest monolith energy — climb if you earned those calves",
    budget: "half",
    modes: ["bike", "car"],
    distance_km: 100,
    ride_time: "~3–5 hrs including climb time",
    best_time: "start climb by 7–8 AM; done before noon heat",
    cost: "~₹150–300",
    vibe: ["monolith", "trek", "views"],
    why: "Savandurga is a granite beast west of Bengaluru. The climb is sweaty and satisfying, the views slap, and the loop roads are a favorite for riders who want half-day mileage without going Mysuru-far.",
    facts: [
      "Savandurga is often called one of Asia's largest monolithic hills.",
      "There are temple approaches and trek routes — pick based on fitness, not ego.",
      "The rock holds heat; midday climbs feel like a tandoor.",
      "Nearby Magadi town is a good snack/fuel reset."
    ],
    stops: [
      { km: 0, name: "Mysore Road / Magadi Road", note: "pick your approach" },
      { km: 40, name: "Magadi", note: "water + biscuits" },
      { km: 50, name: "Savandurga base", note: "start early; carry electrolytes" }
    ],
    flags: [
      "Monolith treks in rain = polished death rock. Skip when wet.",
      "Heat exhaustion is common after 10:30 AM in summer.",
      "Stay on known paths; shortcuts over slabs get sketchy fast.",
      "Carry more water than you think (2L+ per person)."
    ],
    mode_tips: {
      bike: [
        "Magadi Road has mixed surface patches — scan ahead.",
        "Great half-day ride if you skip the full summit climb.",
        "Gloves + sunscreen; granite glare is real."
      ],
      car: [
        "Comfortable for mixed fitness groups — some can chill at base.",
        "Park only in sensible lots; don't block village lanes.",
        "Pack a change of shirt; you'll earn it."
      ],
      public: [
        "Buses toward Magadi, then auto/jeep to base — doable but slow.",
        "Confirm return bus timings before you climb."
      ]
    },
    season: { best: "Nov–Feb early mornings", avoid: "rainy days and Apr–May noon" },
    transit: "Possible via Magadi-bound buses (~₹40–70) + auto to Savandurga base (~₹200–400). Frequency drops later in the day — not ideal if you're racing daylight.",
    origin: "Bengaluru",
    dest: "Savandurga, Karnataka",
    destq: "Savandurga%2C%20Karnataka",
    dlat: 12.9196,
    dlng: 77.2946,
    waypoints: ["Magadi"]
  },
  {
    id: "kanakapura-mekedatu",
    name: "Kanakapura → Mekedatu",
    tagline: "where the river gets spicy — look, don't leap, don't become a statistic",
    budget: "half",
    modes: ["bike", "car"],
    distance_km: 200,
    ride_time: "~5–7 hrs with stops",
    best_time: "morning start; avoid late returns on unfamiliar roads",
    cost: "~₹300–600 (fuel share + food + parking)",
    vibe: ["river", "canyon", "serious-flags"],
    why: "Mekedatu (and Sangama before it) is dramatic — Cauvery squeezed through rock. It's beautiful and it kills people who treat it like a water park. Go for the drive and the view. Stay behind the lines.",
    facts: [
      "Mekedatu means 'goat's leap' — the gorge is that narrow in folklore.",
      "Sangama is the confluence viewpoint often visited on the same loop.",
      "Kanakapura Road is a classic south Bangalore escape corridor.",
      "Water levels change with upstream releases — never assume yesterday's rock is today's rock."
    ],
    stops: [
      { km: 0, name: "Kanakapura Road exit", note: "full tank" },
      { km: 55, name: "Kanakapura town", note: "breakfast + water" },
      { km: 90, name: "Sangama", note: "confluence views; toilets/snacks vary" },
      { km: 100, name: "Mekedatu viewpoint area", note: "OBEY barriers. No swimming." }
    ],
    flags: [
      "PEOPLE DROWN HERE EVERY YEAR. Currents are deceptive. Do not enter the water.",
      "Slippery rocks near the gorge — one misstep is not a cute story.",
      "Ignore influencers standing past railings. Their algorithm isn't your life jacket.",
      "Monsoon and release days make the gorge especially deadly — check local advice."
    ],
    mode_tips: {
      bike: [
        "Longer half-day — pace yourself and hydrate.",
        "Some stretches have sand/gravel near river access roads.",
        "Group riding recommended; signal well on Kanakapura Road."
      ],
      car: [
        "Comfortable family drive if everyone respects the water rules.",
        "Roads near Sangama can jam on holidays — patience.",
        "Carry trash bags; bins overflow on weekends."
      ],
      public: [
        "Buses to Kanakapura, then uncertain last-mile toward Sangama/Mekedatu.",
        "Not a clean public day unless you arrange a local cab from Kanakapura."
      ]
    },
    season: { best: "post-monsoon to winter for views", avoid: "peak flood / heavy release periods for gorge edges" },
    transit: "Public gets you to Kanakapura easily; Sangama/Mekedatu last-mile is the pain. Budget a local cab from Kanakapura or go with private vehicle. Don't improvise walks along river edges.",
    origin: "Bengaluru",
    dest: "Mekedatu, Karnataka",
    destq: "Mekedatu%2C%20Karnataka",
    dlat: 12.2606,
    dlng: 77.3442,
    waypoints: ["Sangama Karnataka"]
  },
  {
    id: "lepakshi",
    name: "Lepakshi Day",
    tagline: "hanging pillar lore + nandi flex — andhra side quest unlocked",
    budget: "full",
    modes: ["bike", "car", "public"],
    distance_km: 240,
    ride_time: "~6–8 hrs including temple time",
    best_time: "leave by 7 AM; temple mornings are kinder",
    cost: "~₹400–800 (fuel share + food + entry if any)",
    vibe: ["temple", "heritage", "day-trip"],
    why: "Lepakshi is the heritage flex near the AP border — Veerabhadra Temple, the hanging pillar story, the giant Nandi. It's a full day that feels like you actually went somewhere, not just looped a dam.",
    facts: [
      "The stone Nandi at Lepakshi is among India's largest monolithic Nandi sculptures.",
      "Veerabhadra Temple is famed for Vijayanagara-era murals and the 'hanging pillar'.",
      "Lepakshi is in Sri Sathya Sai district (AP), ~120 km from Bengaluru.",
      "Combine with Hindupur snacks — the highway food is part of the plot."
    ],
    stops: [
      { km: 0, name: "Airport / NH44 north", note: "early exit from city" },
      { km: 80, name: "Highway breakfast", note: "don't skip water" },
      { km: 120, name: "Lepakshi temple complex", note: "shoes off; dress respectfully" }
    ],
    flags: [
      "Midday sun on stone courtyards is brutal — cap + bottle mandatory.",
      "Don't force the hanging pillar myths into unsafe poking/pushing.",
      "Cross-border highway traffic includes fast buses — give them space.",
      "Return traffic into Bengaluru after 6 PM can erase your evening."
    ],
    mode_tips: {
      bike: [
        "Full-day saddle time — stretch at every stop.",
        "AP highways can be fast and sudden; stay predictable.",
        "Ear plugs if you're on louder machines for hours."
      ],
      car: [
        "Ideal full-day car trip for families and photo folks.",
        "AC nap on the way back is a feature, not a bug.",
        "Keep digital maps offline for the temple town lanes."
      ],
      public: [
        "Buses toward Hindupur / Puttaparthi corridor; hop to Lepakshi by auto.",
        "Start early from Kempegowda / satellite stations.",
        "Confirm last return bus — missing it means expensive cab energy."
      ]
    },
    season: { best: "Oct–Feb", avoid: "peak summer noon temple walks" },
    transit: "Doable: Bengaluru → Hindupur bus/train (~₹100–200), then auto/bus to Lepakshi (~₹100–250). Total public day often ~₹400–700 pp plus food. Timing discipline required.",
    origin: "Bengaluru",
    dest: "Lepakshi, Andhra Pradesh",
    destq: "Lepakshi%20Veerabhadra%20Temple",
    dlat: 13.8047,
    dlng: 77.6097,
    waypoints: []
  },
  {
    id: "shivanasamudra-talakadu",
    name: "Shivanasamudra + Talakadu",
    tagline: "twin falls flex then temple town sand — south karnataka main quest",
    budget: "full",
    modes: ["bike", "car"],
    distance_km: 280,
    ride_time: "~8–10 hrs with both stops",
    best_time: "post-monsoon for falls power; start by 6–6:30 AM",
    cost: "~₹600–1000",
    vibe: ["waterfalls", "temples", "long-day"],
    why: "Gaganachukki and Bharachukki at Shivanasamudra hit different after rains, and Talakadu adds temple-town atmosphere. It's a full day on the road — rewarding if you respect water and timing.",
    facts: [
      "Shivanasamudra hosts twin waterfalls on the Kaveri — Gaganachukki & Bharachukki.",
      "Asia's early hydroelectric project history is tied to this stretch.",
      "Talakadu is known for temples and shifting sand lore along the river.",
      "Fall spray zones are louder and slicker than phone videos suggest."
    ],
    stops: [
      { km: 0, name: "Mysore Road south", note: "full tank + breakfast packed" },
      { km: 120, name: "Shivanasamudra viewpoints", note: "both falls if time allows" },
      { km: 150, name: "Talakadu", note: "temples + river banks — carefully" }
    ],
    flags: [
      "PEOPLE DROWN / GET SWEPT at waterfall basins and river edges every year. Barriers exist for a reason.",
      "Wet rocks near spray zones are ice-rink slippery.",
      "Don't climb past railings for 'better reels'.",
      "Long day fatigue on the return — swap drivers / take breaks."
    ],
    mode_tips: {
      bike: [
        "Big full-day — ear plugs, hydration, and realistic average speeds.",
        "Mysore Road traffic near city is the worst part; after that, ride your ride.",
        "Rain gear if clouds look spicy; fall roads get slick."
      ],
      car: [
        "Best for mixed groups and elders who want viewpoints without scrambling.",
        "Carry snacks; remote stretches have limited clean food options.",
        "Photograph from marked decks only."
      ],
      public: [
        "Possible via Mandya/Mysuru buses with multiple hops — exhausting for both sites in one day.",
        "Consider prioritizing one waterfall cluster if going public-only."
      ]
    },
    season: { best: "Jul–Jan for falls volume + cooler air", avoid: "peak flood danger days near edges" },
    transit: "Public can reach Malavalli / Mandya side with bus hops, then local transport to viewpoints — slow for a same-day Talakadu combo. Private vehicle or tour cab is the realistic full-day mode.",
    origin: "Bengaluru",
    dest: "Shivanasamudra Falls, Karnataka",
    destq: "Shivanasamudra%20Falls",
    dlat: 12.2994,
    dlng: 77.1731,
    waypoints: ["Talakadu"]
  },
  {
    id: "mysuru-day",
    name: "Mysuru Day Hit",
    tagline: "palace flex, dosa destiny, return before bangalore traffic eats you",
    budget: "full",
    modes: ["bike", "car", "public"],
    distance_km: 300,
    ride_time: "~8–10 hrs door to door with city time",
    best_time: "leave 6 AM; palace earlier = shorter queues",
    cost: "~₹800–1500 (travel + meals + palace entry)",
    vibe: ["palace", "food", "city-day"],
    why: "Mysuru is the cleanest 'proper city day' from Bengaluru — palace, markets, chamundi if you have legs left, and food that justifies the fuel. Public transport actually works here.",
    facts: [
      "Mysuru Palace illuminations are especially famous on Sundays/holidays — check schedules.",
      "Chamundi Hill sunset is a popular add-on if you're not temple-ed out.",
      "Mysore pak origin stories are fought over in every sweet shop — pick a busy one.",
      "Railway connectivity makes this one of the best car-free full days."
    ],
    stops: [
      { km: 0, name: "Bengaluru south exit", note: "or start at railway station" },
      { km: 150, name: "Mysuru Palace", note: "book slots if required; dress code-ish respectful" },
      { km: 150, name: "Devaraja Market / food run", note: "sandalwood + snacks" },
      { km: 155, name: "Chamundi Hill (optional)", note: "traffic + steps; timebox it" }
    ],
    flags: [
      "Palace and Chamundi weekends = queue trauma. Weekdays slap harder.",
      "Highway speed + fatigue after a long city day — don't hero the drive back.",
      "Pickpockets in crowded market zones — bag zipped.",
      "Monsoon makes Chamundi steps slippery."
    ],
    mode_tips: {
      bike: [
        "Fully doable but tiring — consider train one way if you can arrange it.",
        "City traffic near palace needs patience.",
        "Secure parking; don't leave jackets with keys in pockets visibly."
      ],
      car: [
        "Toll + parking add up; still comfy for families.",
        "Use periphery parking and walk/auto into core markets.",
        "Leave Mysuru by ~5–5:30 PM to soften Bengaluru re-entry."
      ],
      public: [
        "Best public full-day near Bengaluru: frequent trains (~2–3 hrs) + city buses/autos.",
        "KSRTC deluxe buses are also solid.",
        "Buy return tickets early on holiday weekends."
      ]
    },
    season: { best: "Oct–Mar (Dasara season is magical but crowded)", avoid: "peak Dasara days if you hate queues" },
    transit: "Excellent public option. Train or KSRTC to Mysuru (~₹150–400 pp one way depending on class), local auto/bus for palace/market. This is the template for 'bus-train travellers welcome'.",
    origin: "Bengaluru",
    dest: "Mysuru Palace, Karnataka",
    destq: "Mysuru%20Palace",
    dlat: 12.3052,
    dlng: 76.6552,
    waypoints: []
  },
  {
    id: "chikmagalur-weekend",
    name: "Chikmagalur Weekend",
    tagline: "coffee hills, misty hair, zero emails — malnad therapy unlocked",
    budget: "weekend",
    modes: ["bike", "car", "public"],
    distance_km: 480,
    ride_time: "~5–6 hrs one way",
    best_time: "leave Friday evening or Saturday 5 AM",
    cost: "~₹3k–7k pp (stay + food + travel share; varies hard)",
    vibe: ["coffee", "hills", "weekend-reset"],
    why: "Chikmagalur is Bengaluru's favorite reset button — coffee estates, Mullayanagiri bragging rights, and weather that makes your city apartment look like a mistake. Two days is the minimum viable chill.",
    facts: [
      "Mullayanagiri is among Karnataka's highest peaks — permits/timing rules change, check locally.",
      "Coffee blossom season scents whole valleys — usually around warmer months depending on rains.",
      "Homestays beat generic hotels for vibe if you book verified places.",
      "Belur/Halebidu can be a culture add-on on the return if you're temple-curious."
    ],
    stops: [
      { km: 0, name: "Tumkur Road / NH48 corridor", note: "typical approach" },
      { km: 180, name: "Hassan / roadside meal", note: "stretch legs" },
      { km: 240, name: "Chikmagalur town", note: "check-in + coffee" },
      { km: 260, name: "Mullayanagiri / estate roads", note: "next morning; start early" }
    ],
    flags: [
      "Hill fog + night driving is a bad remix. Prefer daylight ghat sections.",
      "Estate roads can be narrow with oncoming buses — yield gracefully.",
      "Leeches in rainy treks — salt/spray if you're going deep green.",
      "Don't drone illegally over restricted/peak zones."
    ],
    mode_tips: {
      bike: [
        "Legendary weekend ride — respect ghats, don't race strangers.",
        "Rain liner + warm layer even in 'summer'.",
        "Book stay with safe parking."
      ],
      car: [
        "Most comfortable for couples/friends with luggage.",
        "Download offline maps for estate lanes.",
        "One designated night driver rule if you're leaving Friday after work."
      ],
      public: [
        "KSRTC / private sleeper or day buses Bengaluru → Chikmagalur.",
        "Local cabs for Mullayanagiri and estate hopping.",
        "Trains toward Kadur/Birur + bus last-mile also work."
      ]
    },
    season: { best: "Oct–Mar", avoid: "heavy monsoon if you're ghat-nervous at night" },
    transit: "Very doable by bus (frequent overnight options, ~₹500–900+). Local sightseeing needs cabs (~₹2k–4k/day depending on circuit). Train + bus combos exist via Kadur.",
    origin: "Bengaluru",
    dest: "Chikmagalur, Karnataka",
    destq: "Chikmagalur%2C%20Karnataka",
    dlat: 13.3161,
    dlng: 75.772,
    waypoints: []
  },
  {
    id: "coorg-weekend",
    name: "Coorg (Kodagu) Weekend",
    tagline: "mist, pepper vines, and the soft life — kodagu knows what you need",
    budget: "weekend",
    modes: ["bike", "car", "public"],
    distance_km: 530,
    ride_time: "~5–7 hrs one way depending on route",
    best_time: "Friday night bus/car or Saturday dawn",
    cost: "~₹4k–9k pp (stay + food + travel; wide range)",
    vibe: ["mist", "abbey-falls", "homestay"],
    why: "Coorg is the poster child for Bengaluru weekend escapes — greenery, coffee/pepper country, Raja's Seat sunsets, and homestay food that ruins restaurant loyalty. Go for slow, not checklist speedrunning.",
    facts: [
      "Madikeri is the usual base; nearby waterfalls and view points are day-hoppable.",
      "Abbey Falls and Raja's Seat are popular — mornings beat evening tour-bus waves.",
      "Kodagu cuisine (pandi curry, akki roti) is a whole personality.",
      "Monsoon Coorg is cinematic and landslide-prone — check road status."
    ],
    stops: [
      { km: 0, name: "Mysore Road", note: "classic approach via Mysuru" },
      { km: 150, name: "Mysuru bypass snack", note: "fuel humans + vehicle" },
      { km: 265, name: "Madikeri", note: "base camp vibes" },
      { km: 275, name: "Raja's Seat / Abbey Falls", note: "timebox crowds" }
    ],
    flags: [
      "Ghat fog and wet leaves — cut speed, increase following distance.",
      "Landslide-prone stretches in heavy rain; verify road status before leaving.",
      "Leeches on plantation walks in monsoon.",
      "Night wildlife on quieter forest-adjacent roads — slow down."
    ],
    mode_tips: {
      bike: [
        "Bucket-list ghat weekend — ride conservative in mist.",
        "Waterproof luggage; Coorg weather flips moods.",
        "Warm layer for Madikeri evenings."
      ],
      car: [
        "Most popular mode for friend groups.",
        "Book parking-friendly stays in Madikeri.",
        "Don't try to 'do all of Coorg' in 36 hours — pick 3 anchors."
      ],
      public: [
        "Excellent bus connectivity Bengaluru → Madikeri (day/night).",
        "Local taxis for falls/viewpoints.",
        "Mysuru hop + connecting bus also works."
      ]
    },
    season: { best: "Oct–Mar", avoid: "intense monsoon weeks if roads are reporting slides" },
    transit: "Strong public option via KSRTC/private buses to Madikeri (~₹600–1200). Sightseeing is cab-dependent. One of the best non-bike weekend patterns from Bengaluru.",
    origin: "Bengaluru",
    dest: "Madikeri, Coorg",
    destq: "Madikeri%2C%20Kodagu",
    dlat: 12.4244,
    dlng: 75.7382,
    waypoints: []
  },
  {
    id: "hampi-long",
    name: "Hampi Saga",
    tagline: "ruins, boulders, coracle lore — bring shoes, curiosity, and 3 days minimum",
    budget: "long",
    modes: ["bike", "car", "public"],
    distance_km: 700,
    ride_time: "~6–8 hrs one way",
    best_time: "winter mornings for ruins; avoid midday stone heat",
    cost: "~₹6k–12k pp for 3 days (stay + food + local travel)",
    vibe: ["ruins", "boulders", "UNESCO"],
    why: "Hampi isn't a day trip pretending to be culture — it's a boulder-strewn Vijayanagara dreamscape that rewards slow wandering. Give it 2–3 nights or don't bother pretending you 'did Hampi'.",
    facts: [
      "Hampi is a UNESCO World Heritage site — the Vijayanagara capital's remains.",
      "Virupaksha Temple and Vitthala Temple complex are headline anchors.",
      "Sunrise from Matanga or similar viewpoints is a common ritual.",
      "Hippie Island (beyond the river) has a different pace — check ferry/coracle status."
    ],
    stops: [
      { km: 0, name: "Bellary Road / NH corridor", note: "or overnight bus/train" },
      { km: 350, name: "Hosapete (Hospet)", note: "common railhead + stay base" },
      { km: 360, name: "Hampi bazaar / Virupaksha", note: "rent bikes/scooters locally" }
    ],
    flags: [
      "Stone heat in summer is nasty — hydrate and siesta.",
      "Scooter scrapes on boulder paths are common; ride slow.",
      "Respect temple rules and monument conservation barriers.",
      "River crossings depend on water levels — don't improvise."
    ],
    mode_tips: {
      bike: [
        "Epic long ride for experienced tourers; break the journey.",
        "Carry tools/spares; highway stretches are lonely at night.",
        "Once there, local scooter > touring bike for ruin hopping."
      ],
      car: [
        "Comfortable for multi-day with luggage.",
        "Hospet stay + day entries into Hampi is a proven pattern.",
        "Book stays with parking; lanes near bazaar are tight."
      ],
      public: [
        "Train to Hospete is the classic move, then local bus/auto/scooter.",
        "Overnight buses also plentiful.",
        "Best long trip on this list for pure public travellers."
      ]
    },
    season: { best: "Nov–Feb", avoid: "Apr–May stone-oven afternoons" },
    transit: "Excellent: overnight train/bus to Hospete (~₹600–1500+), local transport to Hampi. Rent a scooter for ruins. This is a public-transport triumph if you plan stays ahead.",
    origin: "Bengaluru",
    dest: "Hampi, Karnataka",
    destq: "Hampi%2C%20Karnataka",
    dlat: 15.335,
    dlng: 76.46,
    waypoints: ["Hospete"]
  },
  {
    id: "wayanad-long",
    name: "Wayanad Long Escape",
    tagline: "kerala hills, waterfall spray, plantation air — cross the border, drop the plotline",
    budget: "long",
    modes: ["bike", "car", "public"],
    distance_km: 580,
    ride_time: "~6–8 hrs one way via preferred ghat",
    best_time: "winter clarity; monsoon only if you love rain and check slides",
    cost: "~₹7k–14k pp for 3–4 days",
    vibe: ["kerala", "waterfalls", "plantations"],
    why: "Wayanad is the longer Kerala-hills answer when Coorg wasn't enough greenery. Waterfalls, viewpoints, wildlife zone adjacency, and plantation stays — build a 3+ day loop, not a punishment drive.",
    facts: [
      "Common anchors: Edakkal Caves, Soochipara/Kanthanpara falls, viewpoint circuits around Kalpetta/Vythiri.",
      "Wayanad connects via ghat roads from Karnataka side — surface and mist vary wildly.",
      "Nearby Bandipur / Nagarhole corridors matter for routing.",
      "Spice and tea/coffee plantation walks are the soft adventure default."
    ],
    stops: [
      { km: 0, name: "Mysore Road", note: "usual Bengaluru exit" },
      { km: 150, name: "Mysuru", note: "snack + stretch" },
      { km: 220, name: "Bandipur corridor", note: "DAYLIGHT ONLY through forest stretch" },
      { km: 290, name: "Kalpetta / Vythiri side", note: "base for day loops" }
    ],
    flags: [
      "Bandipur night traffic restrictions: forest stretch is CLOSED to night traffic (typically ~6 PM–6 AM — verify current timings). Plan daylight transit or alternate routes.",
      "Wildlife crossings — speed kills animals and people. Slow down.",
      "Waterfall rocks are slippery; drownings happen when people climb for photos.",
      "Monsoon landslides — check Kerala PWD / local updates before you leave."
    ],
    mode_tips: {
      bike: [
        "Serious touring mileage — don't stack night forest roads.",
        "Rain is frequent; waterproofing is survival, not aesthetic.",
        "Respect wildlife zone speed limits absolutely."
      ],
      car: [
        "Best for multi-stop comfort with friends.",
        "Start early from Bengaluru to clear Bandipur in daylight.",
        "Keep snacks; ghat food stops vary in quality."
      ],
      public: [
        "Buses via Mysuru toward Kalpetta/Sultan Bathery.",
        "Timing matters because of forest night closures on some corridors.",
        "Local cabs needed for waterfall circuits."
      ]
    },
    season: { best: "Oct–Mar", avoid: "unverified monsoon slide weeks; never force Bandipur at night" },
    transit: "Doable by KSRTC/Kerala buses with hops via Mysuru (~₹800–1500+). Mind forest-corridor timing rules. Local sightseeing requires cabs. Overnight plans beat heroic same-day returns.",
    origin: "Bengaluru",
    dest: "Kalpetta, Wayanad",
    destq: "Kalpetta%2C%20Wayanad",
    dlat: 11.6101,
    dlng: 76.0827,
    waypoints: ["Mysuru"]
  }
];

window.CHALO_CITY = "Bengaluru";
window.CHALO_VERSION = "1.0.0";
