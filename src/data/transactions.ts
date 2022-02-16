export interface Security {
  name: string
}

export type Side = 'BUY' | 'SELL'

// A transaction represents a single trade in a security.
export interface Transaction {
  security: Security
  date: string
  side: Side
  price: number
  quantity: number
}

// A position represents a lot of a security. A lot may be split
// by a transaction into a new lot.
export interface Position {
  security: Security
  quantity: number
  price: number
  openDate: string
  closeDate?: string
  closePrice?: number
}

export interface Portfolio {
  positions: Position[]
}

const openPosition = (transaction: Transaction): Position => {
  const { security, date, side, price, quantity } = transaction
  return {
    security,
    quantity: side === 'BUY' ? quantity : 0,
    price,
    openDate: date
  }
}

// Apply a transaction to a portfolio. In the case of a buy, the portfolio simply gains a
// new lot. In the case of a sell, lots are consumed in first-in-first-out-order. Any left
// over quantity in a lot is added to a new position. Note positions are never removed
// from the portfolio. The closeDate field is set to indicate the position is closed.
// TODO: Handle wash sales, flag adjustments caused.
export const processTransaction = (
  portfolio: Portfolio,
  transaction: Transaction
): Portfolio => {
  const { positions } = portfolio

  if (transaction.side === 'BUY') {
    // In the case of a buy, we just open a new position. Simplest case.
    return {
      ...portfolio,
      positions: [...positions, openPosition(transaction)]
    }
  } else {
    // For a sale, we have to handle a few cases.
    // 1. The security is not in the portfolio. This is a short position. For now, this is an exception
    // 2. The security is in the portfolio.
    //    a. We have to consume the quantity from the first matching lot in the portfolio.
    //    b, If there is a remaining quantity, we have to open a new position.
    let remainingQuantity = transaction.quantity
    const newPositions = positions.flatMap((position) => {
      if (
        position.closeDate !== undefined ||
        transaction.security.name !== position.security.name ||
        remainingQuantity <= 0
      ) {
        return [position]
      }

      if (remainingQuantity >= position.quantity) {
        // Entire lot is consumed by the sale
        remainingQuantity -= position.quantity
        return [
          {
            ...position,
            closePrice: transaction.price,
            closeDate: transaction.date
          }
        ]
      } else {
        // Lot is only partially consumed. We have to open a new position
        const closedQuantity = remainingQuantity
        const newQuantity = position.quantity - closedQuantity
        remainingQuantity = 0
        return [
          {
            ...position,
            closeDate: transaction.date,
            closePrice: transaction.price,
            quantity: closedQuantity
          },
          {
            ...position,
            quantity: newQuantity
          }
        ]
      }
    })

    if (remainingQuantity > 0) {
      //  This is an error. We hit a sale which tries to consume more
      // of a security than we have.
      console.error('Transaction list failed for transaction')
      console.error(transaction)
      console.error(newPositions)
      console.error(
        `${remainingQuantity} remaining for security ${transaction.security.name}`
      )
      throw new Error('Transaction list failed')
    }

    return {
      ...portfolio,
      positions: newPositions
    }
  }
}
