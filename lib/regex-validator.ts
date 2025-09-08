// ToBeSentenceValidator.ts
export class ToBeSentenceValidator {
  // Subject patterns
  private static readonly PERSONAL_PRONOUNS = "(I|You|He|She|It|We|They)"
  private static readonly PROPER_NOUNS = "([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)"
  private static readonly COMMON_NOUNS = "((The|A|An)\\s+[a-z]+(?:s)?)"
  private static readonly DEMONSTRATIVE_PRONOUNS = "((This|That|These|Those)\\s+[a-z]+(?:s)?)"

  // Verb TO BE patterns
  private static readonly PRESENT_VERBS = "(am|are|is)"
  private static readonly PAST_VERBS = "(was|were)"

  // Complement patterns (predicates)
  private static readonly COMPLEMENTS = "([a-z]+(?:\\s+[a-z]+)*)"

  private static readonly CAPITALIZATION_PATTERNS = {
    startsWithCapital: /^[A-Z]/,
    properNounCapital: /\b[A-Z][a-z]+/g,
    sentenceStructure: /^[A-Z][^.!?]*[.!?]?$/,
    commonWords: /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi,
  }

  private static readonly ENGLISH_GLOSSARY = new Set([
    // Articles, pronouns, and basic words
    "a",
    "an",
    "the",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "its",
    "our",
    "their",
    "this",
    "that",
    "these",
    "those",
    "who",
    "what",
    "where",
    "when",
    "why",
    "how",

    // Family relationships
    "brother",
    "sister",
    "mother",
    "father",
    "mom",
    "dad",
    "parent",
    "parents",
    "son",
    "daughter",
    "child",
    "children",
    "baby",
    "family",
    "grandfather",
    "grandmother",
    "grandpa",
    "grandma",
    "uncle",
    "aunt",
    "cousin",
    "nephew",
    "niece",
    "husband",
    "wife",
    "married",
    "single",

    // Common adjectives and descriptors
    "big",
    "small",
    "tall",
    "short",
    "long",
    "old",
    "young",
    "new",
    "good",
    "bad",
    "nice",
    "kind",
    "smart",
    "funny",
    "sad",
    "angry",
    "tired",
    "hungry",
    "thirsty",
    "hot",
    "cold",
    "warm",
    "cool",
    "fast",
    "slow",
    "easy",
    "hard",
    "difficult",
    "simple",
    "important",
    "interesting",
    "boring",
    "exciting",
    "scary",
    "safe",
    "dangerous",
    "clean",
    "dirty",
    "quiet",
    "loud",
    "busy",
    "free",
    "full",
    "empty",
    "open",
    "closed",
    "right",
    "wrong",
    "correct",
    "true",
    "false",

    // Common colors
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "black",
    "white",
    "gray",
    "grey",

    // Common places
    "school",
    "university",
    "college",
    "hospital",
    "store",
    "shop",
    "restaurant",
    "cafe",
    "park",
    "library",
    "church",
    "bank",
    "post",
    "office",
    "airport",
    "station",
    "hotel",
    "beach",
    "mountain",
    "river",
    "lake",
    "ocean",
    "city",
    "town",
    "village",
    "country",
    "state",
    "street",
    "road",
    "avenue",
    "building",
    "house",
    "home",
    "apartment",
    "room",
    "kitchen",
    "bathroom",
    "bedroom",
    "living",
    "garden",
    "yard",

    // Verbs (including TO BE)
    "am",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "can",
    "may",
    "might",
    "must",
    "go",
    "goes",
    "went",
    "gone",
    "going",
    "come",
    "comes",
    "came",
    "coming",
    "get",
    "gets",
    "got",
    "getting",
    "make",
    "makes",
    "made",
    "making",
    "take",
    "takes",
    "took",
    "taken",
    "taking",
    "see",
    "sees",
    "saw",
    "seen",
    "seeing",
    "know",
    "knows",
    "knew",
    "known",
    "knowing",
    "think",
    "thinks",
    "thought",
    "thinking",
    "say",
    "says",
    "said",
    "saying",
    "tell",
    "tells",
    "told",
    "telling",
    "give",
    "gives",
    "gave",
    "given",
    "giving",
    "find",
    "finds",
    "found",
    "finding",
    "work",
    "works",
    "worked",
    "working",
    "call",
    "calls",
    "called",
    "calling",
    "try",
    "tries",
    "tried",
    "trying",
    "ask",
    "asks",
    "asked",
    "asking",
    "need",
    "needs",
    "needed",
    "needing",
    "feel",
    "feels",
    "felt",
    "feeling",
    "become",
    "becomes",
    "became",
    "becoming",
    "leave",
    "leaves",
    "left",
    "leaving",
    "put",
    "puts",
    "putting",
    "mean",
    "means",
    "meant",
    "meaning",
    "keep",
    "keeps",
    "kept",
    "keeping",
    "let",
    "lets",
    "letting",
    "begin",
    "begins",
    "began",
    "beginning",
    "seem",
    "seems",
    "seemed",
    "seeming",
    "help",
    "helps",
    "helped",
    "helping",
    "talk",
    "talks",
    "talked",
    "talking",
    "turn",
    "turns",
    "turned",
    "turning",
    "start",
    "starts",
    "started",
    "starting",
    "show",
    "shows",
    "showed",
    "showing",
    "hear",
    "hears",
    "heard",
    "hearing",
    "play",
    "plays",
    "played",
    "playing",
    "run",
    "runs",
    "ran",
    "running",
    "move",
    "moves",
    "moved",
    "moving",
    "live",
    "lives",
    "lived",
    "living",
    "believe",
    "believes",
    "believed",
    "believing",
    "hold",
    "holds",
    "held",
    "holding",
    "bring",
    "brings",
    "brought",
    "bringing",
    "happen",
    "happens",
    "happened",
    "happening",
    "write",
    "writes",
    "wrote",
    "writing",
    "provide",
    "provides",
    "provided",
    "providing",
    "sit",
    "sits",
    "sat",
    "sitting",
    "stand",
    "stands",
    "stood",
    "standing",
    "lose",
    "loses",
    "lost",
    "losing",
    "pay",
    "pays",
    "paid",
    "paying",
    "meet",
    "meets",
    "met",
    "meeting",
    "include",
    "includes",
    "included",
    "including",
    "continue",
    "continues",
    "continued",
    "continuing",
    "set",
    "sets",
    "setting",
    "learn",
    "learns",
    "learned",
    "learning",
    "change",
    "changes",
    "changed",
    "changing",
    "lead",
    "leads",
    "led",
    "leading",
    "understand",
    "understands",
    "understood",
    "understanding",
    "watch",
    "watches",
    "watched",
    "watching",
    "follow",
    "follows",
    "followed",
    "following",
    "stop",
    "stops",
    "stopped",
    "stopping",
    "create",
    "creates",
    "created",
    "creating",
    "speak",
    "speaks",
    "spoke",
    "speaking",
    "read",
    "reads",
    "reading",
    "allow",
    "allows",
    "allowed",
    "allowing",
    "add",
    "adds",
    "added",
    "adding",
    "spend",
    "spends",
    "spent",
    "spending",
    "grow",
    "grows",
    "grew",
    "growing",
    "open",
    "opens",
    "opened",
    "opening",
    "walk",
    "walks",
    "walked",
    "walking",
    "win",
    "wins",
    "won",
    "winning",
    "offer",
    "offers",
    "offered",
    "offering",
    "remember",
    "remembers",
    "remembered",
    "remembering",
    "love",
    "loves",
    "loved",
    "loving",
    "consider",
    "considers",
    "considered",
    "considering",
    "appear",
    "appears",
    "appeared",
    "appearing",
    "buy",
    "buys",
    "bought",
    "buying",
    "wait",
    "waits",
    "waited",
    "waiting",
    "serve",
    "serves",
    "served",
    "serving",
    "die",
    "dies",
    "died",
    "dying",
    "send",
    "sends",
    "sent",
    "sending",
    "expect",
    "expects",
    "expected",
    "expecting",
    "build",
    "builds",
    "built",
    "building",
    "stay",
    "stays",
    "stayed",
    "staying",
    "fall",
    "falls",
    "fell",
    "falling",
    "cut",
    "cuts",
    "cutting",
    "reach",
    "reaches",
    "reached",
    "reaching",
    "kill",
    "kills",
    "killed",
    "killing",
    "remain",
    "remains",
    "remained",
    "remaining",
    "suggest",
    "suggests",
    "suggested",
    "suggesting",

    // Nouns
    "time",
    "person",
    "year",
    "way",
    "day",
    "thing",
    "man",
    "world",
    "life",
    "hand",
    "part",
    "child",
    "eye",
    "woman",
    "place",
    "work",
    "week",
    "case",
    "point",
    "government",
    "company",
    "number",
    "group",
    "problem",
    "fact",
    "home",
    "water",
    "room",
    "mother",
    "area",
    "money",
    "story",
    "month",
    "lot",
    "right",
    "study",
    "book",
    "job",
    "word",
    "business",
    "issue",
    "side",
    "kind",
    "head",
    "house",
    "service",
    "friend",
    "father",
    "power",
    "hour",
    "game",
    "line",
    "end",
    "member",
    "law",
    "car",
    "city",
    "community",
    "name",
    "president",
    "team",
    "minute",
    "idea",
    "kid",
    "body",
    "information",
    "back",
    "parent",
    "face",
    "others",
    "level",
    "office",
    "door",
    "health",
    "person",
    "art",
    "war",
    "history",
    "party",
    "result",
    "change",
    "morning",
    "reason",
    "research",
    "girl",
    "guy",
    "moment",
    "air",
    "teacher",
    "force",
    "education",
    "foot",
    "boy",
    "age",
    "policy",
    "process",
    "music",
    "market",
    "sense",
    "nation",
    "plan",
    "college",
    "interest",
    "death",
    "experience",
    "effect",
    "use",
    "class",
    "control",
    "care",
    "field",
    "development",
    "role",
    "student",
    "oil",
    "situation",
    "cost",
    "industry",
    "figure",
    "street",
    "image",
    "itself",
    "phone",
    "either",
    "data",
    "cover",
    "quite",
    "picture",
    "clear",
    "practice",
    "piece",
    "land",
    "recent",
    "describe",
    "product",
    "doctor",
    "wall",
    "patient",
    "worker",
    "news",
    "test",
    "movie",
    "certain",
    "north",
    "love",
    "personal",
    "open",
    "support",
    "simply",
    "third",
    "technology",
    "catch",
    "step",
    "baby",
    "computer",
    "type",
    "attention",
    "draw",
    "film",
    "republican",
    "tree",
    "source",
    "red",
    "nearly",
    "organization",
    "choose",
    "cause",
    "hair",
    "look",
    "point",
    "century",
    "evidence",
    "window",
    "difficult",
    "listen",
    "soon",
    "culture",
    "basis",
    "town",
    "little",
    "save",
    "animal",
    "factor",
    "decade",
    "article",
    "shoot",
    "east",
    "save",
    "seven",
    "artist",
    "away",
    "scene",
    "stock",
    "career",
    "despite",
    "central",
    "eight",
    "thus",
    "treatment",
    "beyond",
    "happy",
    "exactly",
    "protect",
    "approach",
    "lie",
    "size",
    "dog",
    "fund",
    "serious",
    "occur",
    "media",
    "ready",
    "sign",
    "thought",
    "list",
    "individual",
    "simple",
    "quality",
    "pressure",
    "accept",
    "answer",
    "hard",
    "resource",
    "identify",
    "left",
    "meeting",
    "determine",
    "prepare",
    "disease",
    "whatever",
    "success",
    "argue",
    "cup",
    "particularly",
    "amount",
    "ability",
    "staff",
    "recognize",
    "indicate",
    "character",
    "growth",
    "loss",
    "degree",
    "wonder",
    "attack",
    "herself",
    "region",
    "television",
    "box",
    "tv",
    "training",
    "pretty",
    "trade",
    "deal",
    "election",
    "everybody",
    "physical",
    "lay",
    "general",
    "feeling",
    "standard",
    "bill",
    "message",
    "fail",
    "outside",
    "arrive",
    "analysis",
    "benefit",
    "sex",
    "forward",
    "lawyer",
    "present",
    "section",
    "environmental",
    "glass",
    "answer",
    "skill",
    "sister",
    "pm",
    "professor",
    "operation",
    "financial",
    "crime",
    "stage",
    "ok",
    "compare",
    "authority",
    "miss",
    "design",
    "sort",
    "act",
    "ten",
    "knowledge",
    "gun",
    "station",
    "blue",
    "state",
    "strategy",
    "little",
    "clearly",
    "discuss",
    "indeed",
    "force",
    "truth",
    "song",
    "example",
    "democratic",
    "check",
    "environment",
    "leg",
    "dark",
    "public",
    "various",
    "rather",
    "laugh",
    "guess",
    "executive",
    "set",
    "study",
    "prove",
    "hang",
    "entire",
    "rock",
    "design",
    "enough",
    "forget",
    "since",
    "claim",
    "note",
    "remove",
    "manager",
    "help",
    "close",
    "sound",
    "enjoy",
    "network",
    "legal",
    "religious",
    "cold",
    "form",
    "final",
    "main",
    "science",
    "green",
    "memory",
    "card",
    "above",
    "seat",
    "cell",
    "establish",
    "nice",
    "trial",
    "expert",
    "that",
    "spring",
    "firm",
    "democrat",
    "radio",
    "visit",
    "management",
    "care",
    "avoid",
    "imagine",
    "tonight",
    "huge",
    "ball",
    "no",
    "close",
    "finish",
    "yourself",
    "talk",
    "theory",
    "impact",
    "respond",
    "statement",
    "maintain",
    "charge",
    "popular",
    "traditional",
    "onto",
    "reveal",
    "direction",
    "weapon",
    "employee",
    "cultural",
    "contain",
    "peace",
    "head",
    "control",
    "base",
    "pain",
    "apply",
    "play",
    "measure",
    "wide",
    "shake",
    "fly",
    "interview",
    "manage",
    "chair",
    "fish",
    "particular",
    "camera",
    "structure",
    "politics",
    "perform",
    "bit",
    "weight",
    "suddenly",
    "discover",
    "candidate",
    "top",
    "production",
    "treat",
    "trip",
    "evening",
    "affect",
    "inside",
    "conference",
    "unit",
    "best",
    "style",
    "adult",
    "worry",
    "range",
    "mention",
    "rather",
    "far",
    "deep",
    "front",
    "edge",
    "individual",
    "specific",
    "writer",
    "trouble",
    "necessary",
    "throughout",
    "challenge",
    "fear",
    "shoulder",
    "institution",
    "middle",
    "sea",
    "dream",
    "bar",
    "beautiful",
    "property",
    "instead",
    "improve",
    "stuff",
    "detail",
    "method",
    "sign",
    "somebody",
    "magazine",
    "hotel",
    "soldier",
    "reflect",
    "heavy",
    "sexual",
    "cause",
    "bag",
    "heat",
    "fall",
    "marriage",
    "tough",
    "sing",
    "surface",
    "purpose",
    "exist",
    "pattern",
    "whom",
    "skin",
    "agent",
    "owner",
    "machine",
    "gas",
    "down",
    "ahead",
    "generation",
    "commercial",
    "address",
    "cancer",
    "test",
    "item",
    "reality",
    "coach",
    "step",
    "Mrs",
    "yard",
    "beat",
    "violence",
    "total",
    "tend",
    "investment",
    "discussion",
    "finger",
    "garden",
    "notice",
    "collection",
    "modern",
    "task",
    "partner",
    "positive",
    "civil",
    "kitchen",
    "consumer",
    "shot",
    "budget",
    "wish",
    "painting",
    "scientist",
    "safe",
    "agreement",
    "capital",
    "mouth",
    "nor",
    "victim",
    "newspaper",
    "threat",
    "responsibility",
    "smile",
    "attorney",
    "score",
    "account",
    "interesting",
    "break",
    "audience",
    "rich",
    "dinner",
    "vote",
    "western",
    "relate",
    "travel",
    "debate",
    "prevent",
    "citizen",
    "majority",
    "none",
    "front",
    "born",
    "admit",
    "senior",
    "assume",
    "wind",
    "key",
    "professional",
    "mission",
    "fast",
    "alone",
    "customer",
    "suffer",
    "speech",
    "successful",
    "option",
    "participant",
    "southern",
    "fresh",
    "eventually",
    "forest",
    "video",
    "global",
    "senate",
    "reform",
    "access",
    "restaurant",
    "judge",
    "publish",
    "relation",
    "release",
    "bird",
    "opinion",
    "credit",
    "critical",
    "corner",
    "concerned",
    "recall",
    "version",
    "stare",
    "safety",
    "effective",
    "neighborhood",
    "original",
    "act",
    "troop",
    "income",
    "directly",
    "hurt",
    "species",
    "immediately",
    "track",
    "basic",
    "strike",
    "hope",
    "sky",
    "freedom",
    "absolutely",
    "plane",
    "nobody",
    "achieve",
    "object",
    "attitude",
    "labor",
    "refer",
    "concept",
    "client",
    "powerful",
    "perfect",
    "tell",
    "opportunity",
    "material",
    "sometimes",
    "campaign",
    "cultural",
    "treatment",
    "beyond",
    "computer",
    "energy",
    "period",
    "series",
    "heart",
    "drug",
    "leader",
    "light",
    "voice",
    "wife",
    "whole",
    "police",
    "mind",
    "finally",
    "pull",
    "return",
    "free",
    "military",
    "price",
    "report",
    "less",
    "according",
    "decision",
    "explain",
    "son",
    "hope",
    "develop",
    "view",
    "relationship",
    "carry",
    "town",
    "road",
    "drive",
    "arm",
    "true",
    "federal",
    "break",
    "better",
    "difference",
    "thank",
    "receive",
    "value",
    "international",
    "building",
    "action",
    "full",
    "model",
    "join",
    "season",
    "society",
    "tax",
    "director",
    "early",
    "position",
    "player",
    "agree",
    "especially",
    "record",
    "pick",
    "wear",
    "paper",
    "special",
    "space",
    "ground",
    "form",
    "support",
    "event",
    "official",
    "whose",
    "matter",
    "everyone",
    "center",
    "couple",
    "site",
    "end",
    "project",
    "hit",
    "base",
    "activity",
    "star",
    "table",
    "court",
    "produce",
    "eat",
    "teach",
    "oil",
    "half",
    "situation",
    "easy",
    "cost",
    "industry",
    "figure",
    "face",
    "street",
    "image",
    "itself",
    "phone",
    "either",
    "data",
    "cover",
    "quite",
    "picture",
    "clear",
    "practice",
    "piece",
    "land",
    "recent",
    "describe",
    "product",
    "doctor",
    "wall",
    "patient",
    "worker",
    "news",
  ])

  /**
   * Only include misspellings -> corrected forms.
   * Do NOT include entries where the wrong == right (no self-mapping).
   */
  private static readonly SPELLING_CORRECTIONS: Record<string, string> = {
    i: "I",
    im: "I'm",
    youre: "you're",
    hes: "he's",
    shes: "she's",
    its: "it's",
    there: "their",
    your: "you're",
    to: "too",
    studnet: "student",
    estudent: "student",
    studen: "student",
    studient: "student",
    techer: "teacher",
    theacher: "teacher",
    teecher: "teacher",
    freind: "friend",
    frend: "friend",
    freand: "friend",
    happpy: "happy",
    hapy: "happy",
    beautifull: "beautiful",
    beatiful: "beautiful",
    beutiful: "beautiful",
    docter: "doctor",
    docktor: "doctor",
    enginer: "engineer",
    engeneer: "engineer",
    writter: "writer",
    writter: "writer",
    // Common "to be" verb misspellings
    amm: "am",
    arr: "are",
    iz: "is",
    waz: "was",
    wer: "were",
    // Common article misspellings
    an: "a", // only when used incorrectly, but this might need more context
    // Common adjective misspellings
    gud: "good",
    grate: "great",
    nise: "nice",
    // no 'student': 'student' entries here
  }

  // Build complete patterns
  private static readonly SUBJECT_PATTERN =
    `(${this.PERSONAL_PRONOUNS}|${this.PROPER_NOUNS}|${this.COMMON_NOUNS}|${this.DEMONSTRATIVE_PRONOUNS})`

  // Present tense patterns (note: i flag makes case-insensitive)
  private static readonly PRESENT_AFFIRMATIVE = new RegExp(
    `^${this.SUBJECT_PATTERN}\\s+${this.PRESENT_VERBS}\\s+${this.COMPLEMENTS}\\.?$`,
    "i",
  )

  private static readonly PRESENT_NEGATIVE = new RegExp(
    `^${this.SUBJECT_PATTERN}\\s+${this.PRESENT_VERBS}\\s+not\\s+${this.COMPLEMENTS}\\.?$`,
    "i",
  )

  private static readonly PRESENT_QUESTION = new RegExp(
    `^${this.PRESENT_VERBS}\\s+${this.SUBJECT_PATTERN}\\s+${this.COMPLEMENTS}\\??$`,
    "i",
  )

  // Past tense patterns
  private static readonly PAST_AFFIRMATIVE = new RegExp(
    `^${this.SUBJECT_PATTERN}\\s+${this.PAST_VERBS}\\s+${this.COMPLEMENTS}\\.?$`,
    "i",
  )

  private static readonly PAST_NEGATIVE = new RegExp(
    `^${this.SUBJECT_PATTERN}\\s+${this.PAST_VERBS}\\s+not\\s+${this.COMPLEMENTS}\\.?$`,
    "i",
  )

  private static readonly PAST_QUESTION = new RegExp(
    `^${this.PAST_VERBS}\\s+${this.SUBJECT_PATTERN}\\s+${this.COMPLEMENTS}\\??$`,
    "i",
  )

  static validateSentence(sentence: string): {
    isValid: boolean
    type: string
    errors?: string[]
    corrections?: string
    correctedSentence?: string
  } {
    const trimmed = (sentence || "").trim()
    // performComprehensiveValidation returns corrected sentence if needed
    const validationResult = this.performComprehensiveValidation(trimmed)

    if (!validationResult.isValid) {
      return validationResult
    }

    // If format is valid, check the "to be" patterns
    if (this.PRESENT_AFFIRMATIVE.test(trimmed)) {
      return { isValid: true, type: "present affirmative" }
    }
    if (this.PRESENT_NEGATIVE.test(trimmed)) {
      return { isValid: true, type: "present negative" }
    }
    if (this.PRESENT_QUESTION.test(trimmed)) {
      return { isValid: true, type: "present interrogative" }
    }
    if (this.PAST_AFFIRMATIVE.test(trimmed)) {
      return { isValid: true, type: "past affirmative" }
    }
    if (this.PAST_NEGATIVE.test(trimmed)) {
      return { isValid: true, type: "past negative" }
    }
    if (this.PAST_QUESTION.test(trimmed)) {
      return { isValid: true, type: "past interrogative" }
    }

    // If it didn't match any to-be patterns, check common grammar issues and offer corrections
    const errors = this.detectCommonErrors(trimmed)
    const articleErrors = this.detectMissingArticles(trimmed)
    if (articleErrors.length > 0) errors.push(...articleErrors)

    const corrections = this.generateCorrections(trimmed)

    return {
      isValid: errors.length === 0,
      type: errors.length === 0 ? "valid" : "invalid",
      errors: errors.length ? errors : undefined,
      corrections: corrections.suggestion,
      correctedSentence: corrections.corrected,
    }
  }

  /**
   * Comprehensive formatting validation.
   * Uses a working copy (correctedSentence) so subsequent checks operate on the updated string.
   */
  private static performComprehensiveValidation(sentence: string): {
    isValid: boolean
    type: string
    errors?: string[]
    corrections?: string
    correctedSentence?: string
  } {
    const errors: string[] = []
    let correctedSentence = sentence.trim()
    let working = correctedSentence // use working for checks & progressive corrections

    // 1) Capitalization of the very first character
    if (!this.CAPITALIZATION_PATTERNS.startsWithCapital.test(working)) {
      errors.push("Sentence must start with a capital letter")
      working = working.charAt(0).toUpperCase() + working.slice(1)
      correctedSentence = working
    }

    // 2) Remove double spaces early and keep corrected
    if (/\s{2,}/.test(working)) {
      errors.push("Remove extra spaces between words")
      working = working.replace(/\s+/g, " ").trim()
      correctedSentence = working
    }

    // 3) Spelling errors detection (based on working text)
    const spellingErrors = this.detectSpellingErrors(working)
    if (spellingErrors.length > 0) {
      errors.push(...spellingErrors)
      working = this.correctSpelling(working) // apply correction for next checks
      correctedSentence = working
    }

    // 4) Proper nouns / pronoun capitalization checks (using words and indexes)
    const properNounErrors = this.validateProperNouns(working)
    if (properNounErrors.length > 0) {
      errors.push(...properNounErrors)
      working = this.correctProperNouns(working)
      correctedSentence = working
    }

    // 5) Punctuation at end
    if (!/[.!?]$/.test(working.trim())) {
      errors.push("Sentence should end with proper punctuation (. ! ?)")
      working = working.trim() + "."
      correctedSentence = working
    }

    // 6) Missing article detection (use updated working)
    const articleErrors = this.detectMissingArticles(working)
    if (articleErrors.length > 0) {
      errors.push(...articleErrors)
      // do not auto-apply article here; generateCorrections will produce suggestion
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        type: "formatting_errors",
        errors,
        corrections: `Try: "${correctedSentence}"`,
        correctedSentence,
      }
    }

    return { isValid: true, type: "valid_format", correctedSentence: working }
  }

  /**
   * Check proper nouns and pronouns with respect to positions.
   * - Only "I" must be uppercase (mandatory)
   * - Proper nouns and other pronouns can be uppercase or lowercase (both valid)
   */
  private static validateProperNouns(sentence: string): string[] {
    const errors: string[] = []
    const words = sentence.split(/\s+/)

    words.forEach((word, idx) => {
      const cleanWord = word.replace(/[^\w]/g, "").toLowerCase()
      if (!cleanWord) return

      // Only "I" must always be uppercase
      if (cleanWord === "i" && word !== "I") {
        errors.push('The pronoun "I" must always be capitalized')
      }
    })

    return errors
  }

  /**
   * Detect spelling issues using both SPELLING_CORRECTIONS and ENGLISH_GLOSSARY.
   * Enhanced to check against comprehensive English glossary
   */
  private static detectSpellingErrors(sentence: string): string[] {
    const errors: string[] = []
    const words = sentence.split(/\s+/)

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, "").toLowerCase()
      if (!cleanWord) return

      // First check if it's a known misspelling with correction
      if (Object.prototype.hasOwnProperty.call(this.SPELLING_CORRECTIONS, cleanWord)) {
        const suggestion = this.SPELLING_CORRECTIONS[cleanWord]
        if (suggestion && suggestion.toLowerCase() !== cleanWord) {
          errors.push(`"${cleanWord}" should be spelled as "${suggestion}"`)
          return
        }
      }

      // Then check if it's a valid English word (case-insensitive)
      if (!this.ENGLISH_GLOSSARY.has(cleanWord)) {
        // Check if it might be a proper noun (starts with capital)
        const originalWord = word.replace(/[^\w]/g, "")
        const isProperNoun = /^[A-Z][a-z]+$/.test(originalWord)

        if (!isProperNoun) {
          errors.push(`"${cleanWord}" is not a recognized English word`)
        }
      }
    })

    return errors
  }

  private static correctProperNouns(sentence: string): string {
    let corrected = sentence

    // Always capitalize "I"
    corrected = corrected.replace(/\bi\b/g, "I")

    return corrected
  }

  private static correctSpelling(sentence: string): string {
    let corrected = sentence

    Object.entries(this.SPELLING_CORRECTIONS).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, "gi")
      corrected = corrected.replace(regex, right)
    })

    return corrected
  }

  /**
   * Detect missing articles in patterns like "I am student" but not "I am students" or proper nouns.
   * Heuristic: if noun is singular (doesn't end with 's') and no article (a/an/the) present immediately before it -> suggest article.
   */
  private static detectMissingArticles(sentence: string): string[] {
    const errors: string[] = []
    // capture: subject, verb, optional article, noun
    const pattern = /\b(I|You|He|She|It|We|They)\s+(am|are|is|was|were)\s+(?:(a|an|the)\s+)?([a-z]+)\b/i
    const match = sentence.match(pattern)
    if (match) {
      const article = match[3] // may be undefined
      const noun = match[4]
      if (!article) {
        // If noun looks plural (ends with s) -> likely plural, no article needed
        const isPlural = /s$/i.test(noun)
        // If noun is in proper noun list -> don't demand article
        const properNounsLower = [
          "michael",
          "ann",
          "cartagena",
          "charles",
          "maria",
          "john",
          "mary",
          "colombia",
          "america",
        ]
        const isProper = properNounsLower.includes(noun.toLowerCase())
        if (!isPlural && !isProper) {
          const suggestedArticle = /^[aeiou]/i.test(noun) ? "an" : "a"
          errors.push(
            `Add an article before "${noun}". For example: "${match[1]} ${match[2]} ${suggestedArticle} ${noun}."`,
          )
        }
      }
    }
    return errors
  }

  private static generateCorrections(sentence: string): { suggestion: string; corrected: string } {
    let corrected = sentence

    // 1) Correct common spelling mistakes first
    corrected = this.correctSpelling(corrected)

    // 2) Correct proper nouns and "I"
    corrected = this.correctProperNouns(corrected)

    // 3) If missing article, insert it
    const pattern = /\b(I|You|He|She|It|We|They)\s+(am|are|is|was|were)\s+(?:([a|an|the]+)\s+)?([a-z]+)\b/i
    const match = corrected.match(pattern)
    if (match) {
      const subject = match[1]
      const verb = match[2]
      const hasArticle = !!match[3]
      const noun = match[4]
      if (!hasArticle) {
        // insert a/an heuristically before the noun (skip if plural or proper)
        const isPlural = /s$/i.test(noun)
        const properNounsLower = [
          "michael",
          "ann",
          "cartagena",
          "charles",
          "maria",
          "john",
          "mary",
          "colombia",
          "america",
        ]
        const isProper = properNounsLower.includes(noun.toLowerCase())
        if (!isPlural && !isProper) {
          const article = /^[aeiou]/i.test(noun) ? "an" : "a"
          // replace the subject + verb + noun sequence with added article
          const seqRegex = new RegExp(`\\b(${subject})\\s+(${verb})\\s+(${noun})\\b`, "i")
          corrected = corrected.replace(seqRegex, `${subject} ${verb} ${article} ${noun}`)
        }
      }
    }

    // Ensure capitalization and punctuation and trim spaces
    if (corrected.length > 0) {
      corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1)
    }

    if (!/[.!?]$/.test(corrected.trim())) {
      corrected = corrected.trim() + "."
    }

    corrected = corrected.replace(/\s+/g, " ").trim()

    return {
      suggestion: `Consider writing: "${corrected}"`,
      corrected,
    }
  }

  private static detectCommonErrors(sentence: string): string[] {
    const errors: string[] = []
    const lower = sentence.toLowerCase()

    // Subject/verb agreement heuristics for "to be"
    if (/(^|\s)(i)\s+(is|are|was|were)/.test(lower)) {
      errors.push("Use 'am' with 'I' in present tense, or 'was' in past tense")
    }

    if (/(^|\s)(he|she|it)\s+(am|are)/.test(lower)) {
      errors.push("Use 'is' with he/she/it in present tense")
    }

    if (/(^|\s)(you|we|they)\s+(am|is)/.test(lower)) {
      errors.push("Use 'are' with you/we/they in present tense")
    }

    if (/(^|\s)(i|he|she|it)\s+(were)/.test(lower)) {
      errors.push("Use 'was' with I/he/she/it in past tense")
    }

    if (/(^|\s)(you|we|they)\s+(was)/.test(lower)) {
      errors.push("Use 'were' with you/we/they in past tense")
    }

    if (/\b(a)\s+(am|are|is|was|were)\b/.test(lower)) {
      errors.push("Articles 'a/an' cannot be subjects. Use proper nouns or pronouns")
    }

    if (/\b(am|are|is|was|were)\s+(am|are|is|was|were)\b/.test(lower)) {
      errors.push("Don't use two forms of 'to be' together")
    }

    return errors
  }
}
