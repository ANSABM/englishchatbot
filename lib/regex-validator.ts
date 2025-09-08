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
    techer: "teacher",
    freind: "friend",
    happpy: "happy",
    beautifull: "beautiful",
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
   * - Capitalize known proper nouns if lowercased.
   * - Ensure "I" is uppercase.
   * - If other pronouns are capitalized mid-sentence, warn (they should be lowercase unless it's the first word).
   */
  private static validateProperNouns(sentence: string): string[] {
    const errors: string[] = []
    const words = sentence.split(/\s+/)

    // Proper nouns that should be capitalized if present
    const properNouns = [
      "michael",
      "ann",
      "cartagena",
      "charles",
      "maria",
      "john",
      "mary",
      "colombia",
      "america",
      // remove 'english'/'spanish' here if you consider them common nouns
    ]

    const pronouns = ["i", "you", "he", "she", "it", "we", "they"]

    words.forEach((word, idx) => {
      const cleanWord = word.replace(/[^\w]/g, "").toLowerCase()
      if (!cleanWord) return

      // Proper noun missing capitalization
      if (properNouns.includes(cleanWord) && !/^[A-Z]/.test(word)) {
        errors.push(`"${cleanWord}" should be capitalized as it's a proper noun`)
      }

      // "I" must always be uppercase
      if (cleanWord === "i" && word !== "I") {
        errors.push('The pronoun "I" must always be capitalized')
      }

      // Other pronouns should NOT be capitalized mid-sentence (unless it's the first word)
      if (pronouns.includes(cleanWord) && cleanWord !== "i") {
        if (idx > 0 && /^[A-Z]/.test(word)) {
          errors.push(`"${word}" should not be capitalized unless it's the first word of the sentence`)
        }
      }
    })

    return errors
  }

  /**
   * Detect spelling issues using SPELLING_CORRECTIONS.
   * Only flags an error if there is a true replacement (wrong -> different correct).
   */
  private static detectSpellingErrors(sentence: string): string[] {
    const errors: string[] = []
    const words = sentence.split(/\s+/)

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, "").toLowerCase()
      if (!cleanWord) return
      if (Object.prototype.hasOwnProperty.call(this.SPELLING_CORRECTIONS, cleanWord)) {
        const suggestion = this.SPELLING_CORRECTIONS[cleanWord]
        if (suggestion && suggestion.toLowerCase() !== cleanWord) {
          errors.push(`"${cleanWord}" should be spelled as "${suggestion}"`)
        }
      }
    })

    return errors
  }

  private static correctProperNouns(sentence: string): string {
    let corrected = sentence
    const properNouns = ["michael", "ann", "cartagena", "charles", "maria", "john", "mary", "colombia", "america"]

    properNouns.forEach((noun) => {
      const regex = new RegExp(`\\b${noun}\\b`, "gi")
      corrected = corrected.replace(regex, noun.charAt(0).toUpperCase() + noun.slice(1))
    })

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
        const properNounsLower = ["michael","ann","cartagena","charles","maria","john","mary","colombia","america"]
        const isProper = properNounsLower.includes(noun.toLowerCase())
        if (!isPlural && !isProper) {
          const suggestedArticle = /^[aeiou]/i.test(noun) ? "an" : "a"
          errors.push(`Add an article before "${noun}". For example: "${match[1]} ${match[2]} ${suggestedArticle} ${noun}."`)
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
        const properNounsLower = ["michael","ann","cartagena","charles","maria","john","mary","colombia","america"]
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
