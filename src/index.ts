import SimplePubSub from './SimplePubSub'
import { DocCard, DocHands, DocRules, DocSuits } from './types'

export const CARDS_SETUP: string[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A'
]

export const MAX_CARDS: number = 52

export const SUITS: DocSuits = {
  spades: '♠',
  diamonds: '♦',
  clubs: '♣',
  hearts: '♥'
}

export class DeckOfCards extends SimplePubSub {
  private _values: string[] = [...CARDS_SETUP]
  private _deck: any = {}
  private _dealt: any = {}
  private _rules: DocRules = {
    cardsPerPlayer: 13,
    state: 'face-down',
    players: 4
  }
  private _hands: DocHands = {}

  public EVENTS: any = {
    CARD_DEALT: 'CARD_DEALT',
    DEAL_END: 'DEAL_END',
    DECK_END: 'DECK_END'
  }

  /**
   * deck()
   * creates a deck of cards and stores the rules
   * @param rules: DocRules
   */
  public deck(rules: DocRules, maxCards: number = MAX_CARDS): DocCard[] {
    /**
     * Create a hand, while checking what's been dealt for a unique hand
     */
    const currentDealt: any = []
    this.rules = rules
    while (currentDealt.length < maxCards) {
      const card = this._makeCard()
      const dealt = `${card.suit}::${card.value}`
      if (!this._deck[dealt]) {
        this._deck[dealt] = true
        currentDealt.push(dealt)
      }
    }
    const deck = Object.keys(this._deck)

    return deck.map(this._cardFrom.bind(this))
  }

  public deal(): DocHands {
    const deck: string[] = Object.keys(this._deck)
    const { players, cardsPerPlayer } = this.rules
    const cardsToDeal: number = players * cardsPerPlayer

    const deckSlice: string[] = deck.splice(
      deck.length - cardsToDeal,
      cardsToDeal
    )

    deckSlice.forEach((cardStr: string, index: number) => {
      for (let p = 1; p <= this.rules.players; p++) {
        const card: DocCard = this._cardFrom(deckSlice[index])
        const player: string = `player${p}`
        this._hands[player] = Array.isArray(this.hands[player])
          ? this.hands[player]
          : []
        this._hands[player].push(card)
        this.publish(this.EVENTS.DEAL_END, { player: `player${p}`, index })
      }
    })
    this.publish(this.EVENTS.DEA, { hands: this._hands })
    return this._hands
  }

  /**
   * getter for hands
   */
  get hands(): DocHands {
    return this._hands
  }

  /**
   * getter for rules
   */
  get rules(): DocRules {
    return this._rules
  }

  /**
   * setter for rules
   */

  set rules(rules: DocRules) {
    this._rules = rules
  }

  private _randomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  private _cardFrom(card: string): DocCard {
    const [suit, value] = card.split('::')

    return {
      suit,
      value,
      symbol: SUITS[suit],
      state: 'face-down',
      rules: this.rules
    }
  }

  private _makeCard(): DocCard {
    const suitNames: string[] = Object.keys(SUITS)
    const suit = suitNames[this._randomInt(0, suitNames.length - 1)]

    return {
      suit,
      value: this._values[this._randomInt(0, this._values.length - 1)],
      symbol: SUITS[suit],
      state: 'face-down',
      rules: this.rules
    }
  }
}
