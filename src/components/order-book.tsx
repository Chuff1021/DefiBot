import type { OrderBookLevel } from "@/lib/types";

type Props = {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
};

export function OrderBook({ asks, bids }: Props) {
  return (
    <div className="orderbook">
      <div className="orderbook__section">
        <div className="panel-title">Asks</div>
        {asks
          .slice()
          .reverse()
          .map((level) => (
            <div className="book-row book-row--ask" key={`ask-${level.price}`}>
              <span>{level.price.toLocaleString()}</span>
              <span>{level.size.toFixed(3)}</span>
            </div>
          ))}
      </div>
      <div className="orderbook__spread">Spread-aware paper fills only</div>
      <div className="orderbook__section">
        <div className="panel-title">Bids</div>
        {bids.map((level) => (
          <div className="book-row book-row--bid" key={`bid-${level.price}`}>
            <span>{level.price.toLocaleString()}</span>
            <span>{level.size.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
