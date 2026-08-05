export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  suit?: Suit;
  number: number;
  keywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversed: string;
  element: string;
  astrology?: string | undefined;
  /** Alternate titles in other traditions, keyed by deck id. */
  altNames?: Record<string, string> | undefined;
}

type MajorRow = [
  number,
  string,
  string[],
  string[],
  string,
  string,
  string,
  string,
  Record<string, string>?,
];

const majors: MajorRow[] = [
  [0, "The Fool", ["beginnings", "innocence", "leap of faith"], ["recklessness", "hesitation", "naivety"],
    "A threshold moment. The Fool steps off the cliff trusting that the ground will meet him. You are being asked to begin before you feel ready, to travel light, and to let curiosity outrank caution.",
    "Either you are frozen at the edge, talking yourself out of the leap, or you are leaping without looking at all. Ask what you are refusing to prepare for — and what you are refusing to risk.",
    "Air", "Uranus", { egyptian: "El Loco", thoth: "The Fool (Aleph)", isis: "The Wanderer" }],
  [1, "The Magician", ["manifestation", "will", "resourcefulness"], ["manipulation", "scattered power", "illusion"],
    "Everything you need is already on the table. This is the card of focused will — intention translated into action, thought made material through skill and nerve.",
    "Power leaking sideways: talent unused, promises bigger than delivery, or someone bending truth to steer you. Realign the intent with the act.",
    "Air", "Mercury", { egyptian: "El Mago", thoth: "The Magus", isis: "The Adept" }],
  [2, "The High Priestess", ["intuition", "mystery", "inner knowing"], ["secrets", "disconnection", "ignored instinct"],
    "The veil parts only for the patient. Knowledge here is not argued for; it is felt. Trust the answer that arrived before the reasoning did.",
    "You have talked yourself out of what you already know, or something is being deliberately kept from view. Return to silence before deciding.",
    "Water", "Moon", { egyptian: "La Sacerdotisa", thoth: "The Priestess", isis: "Isis Veiled" }],
  [3, "The Empress", ["abundance", "nurture", "creation"], ["depletion", "smothering", "creative block"],
    "Fertile ground. Projects, bodies, and relationships want tending rather than forcing. Give what you are growing time, sensory pleasure, and generous care.",
    "The well has run dry from over-giving, or care has curdled into control. Feed yourself first; growth resumes where there is nourishment.",
    "Earth", "Venus", { egyptian: "La Emperatriz", thoth: "The Empress", isis: "Isis Crowned" }],
  [4, "The Emperor", ["structure", "authority", "protection"], ["rigidity", "domination", "weak boundaries"],
    "Order as an act of love. Build the frame, set the rule, hold the line. Freedom in this card comes from structure, not despite it.",
    "Control has hardened past usefulness, or no one is holding the frame at all. Examine your relationship to authority — yours and others'.",
    "Fire", "Aries", { egyptian: "El Emperador", thoth: "The Emperor", isis: "Osiris Enthroned" }],
  [5, "The Hierophant", ["tradition", "teaching", "belonging"], ["dogma", "rebellion", "hollow ritual"],
    "The wisdom of the lineage. Seek the teacher, the proven method, the community that has walked this road before you.",
    "The old form no longer fits. Either you are performing a belief you no longer hold, or you are rejecting structure purely to prove you can.",
    "Earth", "Taurus", { egyptian: "El Sumo Sacerdote", thoth: "The Hierophant", isis: "The Keeper of Rites" }],
  [6, "The Lovers", ["union", "choice", "alignment"], ["discord", "misalignment", "avoidance"],
    "A meeting that changes you, and the choice that comes with it. Beyond romance, this is about values: choosing what you will be joined to.",
    "A split between what you want and what you have agreed to. Name the choice you have been avoiding making out loud.",
    "Air", "Gemini", { egyptian: "Los Enamorados", thoth: "The Lovers", isis: "The Sacred Marriage" }],
  [7, "The Chariot", ["drive", "victory", "control"], ["stalling", "scattered force", "burnout"],
    "Two opposing forces yoked to one direction. Momentum is available if you will steer it — willpower plus a destination.",
    "Wheels spinning, or a win pursued so hard the cost outgrew the prize. Slow enough to choose the road again.",
    "Water", "Cancer", { egyptian: "El Carro", thoth: "The Chariot", isis: "The Solar Barque" }],
  [8, "Strength", ["courage", "gentleness", "mastery"], ["self-doubt", "force", "raw nerve"],
    "The lion is not defeated, it is befriended. Real power here is patience with your own wildness, and steadiness under pressure.",
    "Fear dressed as inadequacy, or strength applied as force. Soften the grip; the appetite you are fighting only wants attention.",
    "Fire", "Leo", { egyptian: "La Fuerza", thoth: "Lust", isis: "Sekhmet Tamed" }],
  [9, "The Hermit", ["solitude", "search", "inner light"], ["isolation", "avoidance", "lost thread"],
    "Withdraw on purpose. The lantern only shows one step at a time, and that is enough. Answers come from the quiet, not the crowd.",
    "Retreat has become hiding, or you have been too busy to hear yourself. Rejoin, or truly go inward — but choose.",
    "Earth", "Virgo", { egyptian: "El Ermitaño", thoth: "The Hermit", isis: "The Lamp Bearer" }],
  [10, "Wheel of Fortune", ["cycles", "fate", "turning point"], ["resistance", "bad timing", "repetition"],
    "The wheel moves whether or not you are ready. Luck, timing, and karma converge — meet the turn rather than bracing against it.",
    "A cycle repeating because its lesson is unfinished, or a delay that is not personal. Loosen your grip on the outcome.",
    "Fire", "Jupiter", { egyptian: "La Rueda", thoth: "Fortune", isis: "The Turning Sky" }],
  [11, "Justice", ["truth", "balance", "consequence"], ["bias", "evasion", "imbalance"],
    "Cause and effect made visible. Decisions here must be honest and proportionate; the scales weigh intention alongside action.",
    "A story told to yourself, an accounting avoided, or an unfair burden carried. Bring the ledger into daylight.",
    "Air", "Libra", { egyptian: "La Justicia", thoth: "Adjustment", isis: "Ma'at's Feather" }],
  [12, "The Hanged Man", ["surrender", "new angle", "pause"], ["stalling", "martyrdom", "stuck"],
    "Suspension with a purpose. Nothing moves — and that is the medicine. Invert the question and the answer reveals itself.",
    "Sacrifice without meaning, or waiting used as an excuse. If the pause has taught you what it came to teach, come down.",
    "Water", "Neptune", { egyptian: "El Colgado", thoth: "The Hanged Man", isis: "The Suspended One" }],
  [13, "Death", ["ending", "transformation", "release"], ["clinging", "stagnation", "slow ending"],
    "Not literal death — a decisive ending that makes room. What is finishing has already finished; the ritual is in admitting it.",
    "Holding the shape of something that has lost its life. The transition is happening anyway; resistance only lengthens it.",
    "Water", "Scorpio", { egyptian: "La Muerte", thoth: "Death", isis: "Anubis at the Threshold" }],
  [14, "Temperance", ["balance", "blending", "patience"], ["excess", "impatience", "discord"],
    "The alchemist's card. Two things that should not mix are being combined slowly, correctly, into something finer. Moderate, adjust, wait.",
    "Too much of one thing, or the mixture rushed. Return to the measured pace — the recipe works only at the right heat.",
    "Fire", "Sagittarius", { egyptian: "La Templanza", thoth: "Art", isis: "The Vessel of Mixing" }],
  [15, "The Devil", ["attachment", "shadow", "appetite"], ["release", "awakening", "reclaimed power"],
    "The chains are loose. Look plainly at the thing you say you cannot stop: the habit, the person, the story about money or worth.",
    "A binding loosening. You are seeing the mechanism for what it is — this is the beginning of walking out.",
    "Earth", "Capricorn", { egyptian: "El Diablo", thoth: "The Devil", isis: "Set the Binder" }],
  [16, "The Tower", ["upheaval", "revelation", "collapse"], ["delayed disaster", "fear of change", "averted crisis"],
    "The structure built on a false foundation comes down in a single stroke. Painful, fast, and clarifying. What survives is true.",
    "You feel the tremors and are bracing. Either a reckoning is being postponed at cost, or you dismantled it yourself in time.",
    "Fire", "Mars", { egyptian: "La Torre", thoth: "The Tower", isis: "The Struck Obelisk" }],
  [17, "The Star", ["hope", "healing", "guidance"], ["dimmed faith", "self-doubt", "disconnection"],
    "After the Tower, the sky clears. Gentle renewal, inspiration, and the sense of being quietly guided. Pour something back into the world.",
    "Faith has thinned. Not gone — thinned. Find the smallest true source of hope and tend it before asking for more.",
    "Air", "Aquarius", { egyptian: "La Estrella", thoth: "The Star", isis: "Sothis Rising" }],
  [18, "The Moon", ["illusion", "dreams", "the unconscious"], ["clarity", "released fear", "truth surfacing"],
    "The path runs between the towers in half-light. Feelings are data, but not all of them are facts. Move slowly; let the dream speak.",
    "Fog lifting. What frightened you is being named, and it is smaller in daylight than it was at 3am.",
    "Water", "Pisces", { egyptian: "La Luna", thoth: "The Moon", isis: "Khonsu's Mirror" }],
  [19, "The Sun", ["joy", "clarity", "vitality"], ["dulled joy", "delay", "overexposure"],
    "Unambiguous good. Warmth, success, and the simple pleasure of being seen exactly as you are. Say yes without hedging.",
    "Happiness present but muted — by exhaustion, by comparison, or by not letting yourself have it. The sun is still up.",
    "Fire", "Sun", { egyptian: "El Sol", thoth: "The Sun", isis: "Ra Ascendant" }],
  [20, "Judgement", ["reckoning", "awakening", "calling"], ["self-judgement", "avoidance", "doubt"],
    "A summons. Something from the past resurfaces to be evaluated honestly, and a larger calling asks for your answer.",
    "The call is heard and refused, or drowned in self-criticism. Judgement asks for honesty, not punishment.",
    "Fire", "Pluto", { egyptian: "El Juicio", thoth: "The Aeon", isis: "The Weighing of Hearts" }],
  [21, "The World", ["completion", "wholeness", "arrival"], ["unfinished", "loose ends", "delayed closure"],
    "The circle closes. A chapter completes with everything it needed to teach, and the next begins from higher ground.",
    "Nearly there. A final step, conversation, or acceptance is missing. Finish it properly and the door opens.",
    "Earth", "Saturn", { egyptian: "El Mundo", thoth: "The Universe", isis: "The Ouroboros" }],
];

const suitData: Record<
  Suit,
  { element: string; theme: string; domain: string; label: string }
> = {
  wands: { element: "Fire", theme: "will, drive and creative spark", domain: "ambition, work and passion", label: "Wands" },
  cups: { element: "Water", theme: "feeling, love and intuition", domain: "relationships, emotion and dreams", label: "Cups" },
  swords: { element: "Air", theme: "mind, truth and conflict", domain: "thought, speech and decisions", label: "Swords" },
  pentacles: { element: "Earth", theme: "body, money and craft", domain: "resources, health and the material world", label: "Pentacles" },
};

type MinorRow = [string, string[], string[], string, string];

const minorMeanings: Record<Suit, MinorRow[]> = {
  wands: [
    ["Ace", ["spark", "new venture", "raw energy"], ["false start", "delay", "lost nerve"], "A pure ignition of desire — an idea that makes your hands itch. Say yes while it is still hot.", "The spark is there but not catching: hesitation, poor timing, or an idea you have not yet spoken aloud."],
    ["Two", ["planning", "vision", "first step"], ["fear of leaving", "narrow view", "indecision"], "Standing with the world in your hand, deciding how far to go. The map is drawn; the journey is not begun.", "Playing small, or planning endlessly to avoid the risk of choosing one road."],
    ["Three", ["expansion", "foresight", "ships coming in"], ["delays", "shortsightedness", "over-reach"], "Your effort has left the harbour. Wait with confidence and prepare for what returns bigger than it left.", "Results slower than hoped, or a plan built without room for the long view."],
    ["Four", ["celebration", "home", "milestone"], ["unstable ground", "postponed joy", "transition"], "A threshold worth marking: stability, welcome, and community. Celebrate before moving on.", "The foundation is not yet firm, or you skipped past a joy that deserved acknowledgment."],
    ["Five", ["competition", "friction", "scrappy energy"], ["avoided conflict", "exhaustion", "resolution"], "Everyone talking at once. Conflict here is not fatal — it is how the strongest version gets forged.", "Either the argument is being suppressed, or the fight has drained everyone and it is time to stop."],
    ["Six", ["victory", "recognition", "confidence"], ["ego", "unrecognised effort", "hollow win"], "Public acknowledgment of real work. Ride the horse, accept the praise, keep the head clear.", "Praise that is not landing, or a win that mattered more to your pride than to your life."],
    ["Seven", ["defence", "conviction", "holding ground"], ["overwhelm", "giving up", "defensiveness"], "You hold the high ground. Defend the thing you have built; you have more advantage than you feel.", "Fighting on too many fronts, or defending a position that no longer needs guarding."],
    ["Eight", ["speed", "momentum", "news"], ["delay", "chaos", "scattered aim"], "Everything moves at once. Messages arrive, plans accelerate, travel and answers come quickly.", "Slowdowns and crossed wires, or motion without direction."],
    ["Nine", ["resilience", "last stand", "wariness"], ["depletion", "paranoia", "stubbornness"], "Wounded but standing. One more push. Guard your energy and remember why you are still here.", "Defensiveness has outlived the threat. Rest — you are exhausted, not weak."],
    ["Ten", ["burden", "responsibility", "overload"], ["release", "delegation", "collapse"], "You are carrying more than your share, and nearly at the door. Set some of it down before you arrive.", "The load is being released — or it is about to drop. Delegate deliberately rather than by breakdown."],
    ["Page", ["curiosity", "message", "beginner's fire"], ["restlessness", "flakiness", "unfocused"], "A young flame: an invitation, a new interest, permission to be an enthusiastic amateur.", "Enthusiasm that evaporates on contact with effort, or news that keeps not arriving."],
    ["Knight", ["boldness", "adventure", "charge"], ["recklessness", "burnout", "half-finished"], "Full-throttle pursuit. Charisma and courage carry the day, provided the direction is chosen.", "Speed without steering: leaping into things and leaving them unfinished."],
    ["Queen", ["warmth", "magnetism", "confidence"], ["jealousy", "self-doubt", "burnout"], "Radiant, self-possessed leadership. She draws people in by being wholly herself.", "Confidence borrowed from others' approval, or warmth turned to heat."],
    ["King", ["vision", "leadership", "bold command"], ["tyranny", "impulsiveness", "arrogance"], "Mature creative authority. He sets a direction others willingly follow and takes responsibility for it.", "Leading by force or ego, or a vision no one was consulted about."],
  ],
  cups: [
    ["Ace", ["new love", "open heart", "emotional beginning"], ["closed heart", "spilled feeling", "hesitancy"], "The cup overflows. A new feeling, connection, or creative tenderness offers itself. Receive it.", "Feeling withheld — yours or theirs. The offer is there but the heart is guarded."],
    ["Two", ["partnership", "mutual regard", "attraction"], ["imbalance", "rupture", "mismatch"], "Two people meeting as equals. A vow, a truce, a genuine mutual seeing.", "One person is pouring and one is holding the cup. Recalibrate or name it."],
    ["Three", ["friendship", "celebration", "community"], ["gossip", "excess", "third party"], "Chosen family. Joy multiplied by sharing it. Say yes to the invitation.", "Social noise draining you, or a third presence complicating an intimacy."],
    ["Four", ["apathy", "reflection", "discontent"], ["new openness", "acceptance", "stirring"], "A cup is being offered and you are looking away. Boredom here is a message, not a verdict.", "The fog lifts; you notice what was always being handed to you."],
    ["Five", ["grief", "loss", "regret"], ["forgiveness", "moving on", "acceptance"], "Three cups spilled, two still standing. Grieve honestly — then turn around and count what remains.", "The turn toward what remains. Forgiveness, including of yourself, becomes possible."],
    ["Six", ["nostalgia", "innocence", "reunion"], ["living in the past", "idealising", "letting go"], "Sweetness from the past visits: an old friend, a childhood comfort, uncomplicated kindness.", "Memory used as a hiding place, or a past relationship idealised beyond recognition."],
    ["Seven", ["options", "fantasy", "imagination"], ["clarity", "commitment", "disillusion"], "Many shining choices, not all of them real. Dream widely, then test each cup for substance.", "The illusions dissolve and one genuine option remains. Choose it."],
    ["Eight", ["walking away", "search for meaning", "departure"], ["fear of leaving", "return", "drifting"], "Leaving something good-enough in search of something true. A dignified, deliberate exit.", "Circling the exit without taking it, or returning to what you already outgrew."],
    ["Nine", ["contentment", "wish fulfilled", "satisfaction"], ["smugness", "unmet wish", "surface pleasure"], "The wish card. Emotional satisfaction, pleasure taken without guilt, a full cup in hand.", "Getting what you wanted and finding it hollow — check whether the wish was really yours."],
    ["Ten", ["harmony", "family", "emotional fulfilment"], ["strained bonds", "ideal vs reality", "distance"], "Lasting emotional peace — the rainbow after the work. Belonging that does not need defending.", "A picture-perfect surface with distance underneath. Repair asks for honesty, not performance."],
    ["Page", ["sensitivity", "invitation", "creative message"], ["moodiness", "escapism", "immaturity"], "A tender message or creative impulse. Let yourself be a little starry-eyed.", "Feelings used as weather to hide in, or an offer you are too shy to answer."],
    ["Knight", ["romance", "the offer", "following the heart"], ["moodiness", "unreliability", "illusion"], "The one who arrives with the proposal. Grace, romance, and idealism in motion.", "Charm without follow-through, or a promise made in a feeling that has since passed."],
    ["Queen", ["compassion", "intuition", "emotional depth"], ["over-giving", "boundary loss", "martyrdom"], "The most attuned card in the deck. She feels the room and holds it without drowning.", "Absorbing everyone's feelings as your own. Boundaries are also love."],
    ["King", ["emotional mastery", "calm", "diplomacy"], ["suppression", "manipulation", "coldness"], "Deep water, steady surface. Feeling fully and still choosing wisely.", "Emotions managed by burying them, or feeling used as leverage."],
  ],
  swords: [
    ["Ace", ["clarity", "truth", "breakthrough"], ["confusion", "harsh words", "muddled thinking"], "A blade of clarity cuts the knot. The truth arrives clean, and naming it changes everything.", "Clarity used as a weapon, or a mind talking in circles. Wait before you speak."],
    ["Two", ["stalemate", "avoidance", "hard choice"], ["decision made", "information revealed", "overwhelm"], "Blindfolded with two blades crossed. You are refusing to look at information you already have.", "The blindfold comes off. The choice becomes obvious — and it was always yours."],
    ["Three", ["heartbreak", "painful truth", "grief"], ["healing", "forgiveness", "residual pain"], "Clean, sharp pain. Something true and hurtful has been said. Sorrow here is honest and it passes.", "The wound is closing. Old grief still aches but no longer rules."],
    ["Four", ["rest", "recovery", "retreat"], ["burnout", "restlessness", "forced pause"], "Deliberate stillness. Lay the sword down and heal; nothing needs to be solved today.", "Rest refused until the body enforces it. Stop before you are stopped."],
    ["Five", ["conflict", "hollow victory", "ego"], ["reconciliation", "regret", "walking away"], "Winning at a cost that outweighs it. Ask whether being right is worth this particular field.", "Making amends, or choosing to leave the argument unfinished on purpose."],
    ["Six", ["transition", "moving on", "safer water"], ["stuck", "unfinished baggage", "delayed exit"], "A quiet crossing to calmer water. Not a triumph — a relief. Take the passage.", "Carrying the same trouble to a new shore, or unable to push off at all."],
    ["Seven", ["strategy", "stealth", "self-interest"], ["exposure", "confession", "return"], "Acting alone and cleverly. Sometimes wise, sometimes a dodge — check which one this is.", "The truth surfaces. Come clean before it is discovered for you."],
    ["Eight", ["restriction", "victim mindset", "trapped"], ["release", "self-liberation", "new perspective"], "The bindings are loose and the blades leave a path. The trap is largely in the story being told.", "You loosen a rope you tied yourself. Freedom starts as a change of mind."],
    ["Nine", ["anxiety", "3am fear", "dread"], ["relief", "perspective", "sharing the fear"], "Night terrors. The mind at its most catastrophic. Very little of this survives daylight.", "The worst imaginings lose grip once spoken to someone. Ask for help."],
    ["Ten", ["rock bottom", "final ending", "betrayal"], ["recovery", "survival", "dawn"], "It is finished, dramatically. The worst has happened — and the sun is rising behind it.", "Slow recovery. Refusing to let a wound become an identity."],
    ["Page", ["curiosity", "vigilance", "learning"], ["gossip", "scattered mind", "haste"], "A sharp new interest, questions asked, information gathered. Keep the notebook close.", "Words moving faster than facts. Verify before repeating."],
    ["Knight", ["directness", "speed", "conviction"], ["aggression", "tunnel vision", "burnout"], "The fastest card in the deck. Argument, ambition, and charge — say it and mean it.", "Cutting through people rather than problems."],
    ["Queen", ["discernment", "honesty", "clear boundaries"], ["coldness", "bitterness", "cutting words"], "Perceptive and unsentimental. She sees through it and says it kindly but plainly.", "Experience turned to armour, honesty turned to blade."],
    ["King", ["judgement", "intellect", "ethical clarity"], ["dogma", "control", "detachment"], "Principled clarity. Decisions made from reason and held with integrity.", "Reason without heart, or rules used to avoid feeling."],
  ],
  pentacles: [
    ["Ace", ["opportunity", "seed money", "new resource"], ["missed chance", "scarcity mindset", "delay"], "A tangible offer: work, money, a home, a body-level fresh start. Plant it properly.", "An opportunity slipping, or scarcity thinking talking you out of an open door."],
    ["Two", ["juggling", "adaptability", "flow"], ["overcommitment", "dropped ball", "imbalance"], "Keeping several things airborne with grace. Flexible, playful management of demands.", "One too many commitments. Something must be put down deliberately."],
    ["Three", ["craft", "collaboration", "apprenticeship"], ["misaligned team", "sloppiness", "lack of feedback"], "Skill recognised and combined with others'. The work gets better because it is shared.", "Working without feedback, or a team pulling in different directions."],
    ["Four", ["saving", "security", "holding on"], ["release", "generosity", "loosening grip"], "Building reserves and guarding what is yours. Prudent — until it becomes a clenched fist.", "Letting money, control, or possessions circulate again."],
    ["Five", ["hardship", "exclusion", "lack"], ["recovery", "help accepted", "end of hard times"], "Cold outside the lit window. Material or spiritual scarcity — and help nearer than it looks.", "The turn: aid accepted, warmth found, the lean season ending."],
    ["Six", ["generosity", "give and take", "support"], ["strings attached", "dependency", "imbalance"], "Resources flowing where they are needed. Give freely or receive gracefully.", "Charity with conditions, or a dynamic where the scales never level."],
    ["Seven", ["patience", "assessment", "long game"], ["impatience", "sunk cost", "poor return"], "Leaning on the hoe, assessing the crop. Growth is happening below the visible line.", "Pouring effort into ground that will not yield. Reassess honestly."],
    ["Eight", ["mastery", "diligence", "practice"], ["perfectionism", "drudgery", "cut corners"], "Repetition as devotion. Skill built one deliberate hour at a time.", "Grinding without joy, or rushing work that requires care."],
    ["Nine", ["independence", "earned comfort", "self-sufficiency"], ["overwork", "loneliness", "dependency"], "The garden you built yourself. Refined, self-earned enjoyment of your own life.", "Success that has cost connection, or comfort that relies on someone else."],
    ["Ten", ["legacy", "wealth", "family foundation"], ["instability", "inheritance conflict", "short-termism"], "Lasting material security shared across generations. Roots, home, continuity.", "Foundations shakier than they appear, or family and money entangled."],
    ["Page", ["study", "new skill", "practical start"], ["procrastination", "distraction", "unrealistic plan"], "A student's card. Enrol, apprentice, begin the practical thing you have been circling.", "Plans admired but not started, or ambition without a first step."],
    ["Knight", ["steadiness", "reliability", "method"], ["stagnation", "boredom", "over-caution"], "The slowest and most dependable knight. Consistency beats brilliance here.", "Routine become rut. Change one variable."],
    ["Queen", ["nurture", "practicality", "abundance"], ["overwork", "self-neglect", "smothering"], "Grounded generosity — she makes places where people and plants thrive, herself included.", "Caring for everything except your own body and bank account."],
    ["King", ["prosperity", "stewardship", "stability"], ["greed", "rigidity", "status obsession"], "Mature material mastery, used to make others secure as well as himself.", "Wealth as identity, or control disguised as prudence."],
  ],
};

const rankNumber: Record<string, number> = {
  Ace: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8,
  Nine: 9, Ten: 10, Page: 11, Knight: 12, Queen: 13, King: 14,
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const MAJOR_ARCANA: TarotCard[] = majors.map(
  ([number, name, keywords, reversedKeywords, upright, reversed, element, astrology, altNames]) => ({
    id: slug(name),
    name,
    arcana: "major" as const,
    number,
    keywords,
    reversedKeywords,
    upright,
    reversed,
    element,
    astrology,
    altNames,
  }),
);

export const MINOR_ARCANA: TarotCard[] = (Object.keys(minorMeanings) as Suit[]).flatMap((suit) =>
  minorMeanings[suit].map(([rank, keywords, reversedKeywords, upright, reversed]) => {
    const name = `${rank} of ${suitData[suit].label}`;
    return {
      id: slug(name),
      name,
      arcana: "minor" as const,
      suit,
      number: rankNumber[rank] ?? 0,
      keywords,
      reversedKeywords,
      upright,
      reversed,
      element: suitData[suit].element,
    } satisfies TarotCard;
  }),
);

export const ALL_CARDS: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export const SUITS = suitData;

export function getCard(id: string): TarotCard | undefined {
  return ALL_CARDS.find((card) => card.id === id);
}