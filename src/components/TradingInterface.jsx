import React, { useState } from "react";
import "./TradingInterface.css";

const API_KEY = ""; // Replace with your actual API key

const BUY_PRESETS = [0.1, 0.25, 0.5, 0.75, 1];
const SELL_PRESETS = ["25%", "50%", "100%"];

const TradingInterface = () => {
  const initialFormState = {
    mint: "",
    amount: "",
    denominatedInSol: "true",
    slippage: "50",
    priorityFee: "0.01",
    pool: "pump",
  };

  const [buyForm, setBuyForm] = useState({ ...initialFormState });
  const [sellForm, setSellForm] = useState({ ...initialFormState });
  const [response, setResponse] = useState({ buy: null, sell: null });
  const [error, setError] = useState({ buy: null, sell: null });
  const [loading, setLoading] = useState({ buy: false, sell: false });

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section === "buy") {
      setBuyForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setSellForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const executePresetBuy = async (amount) => {
    if (!buyForm.mint) {
      setError((prev) => ({
        ...prev,
        buy: "Please enter a token contract address",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, buy: true }));
    setError((prev) => ({ ...prev, buy: null }));
    setResponse((prev) => ({ ...prev, buy: null }));

    try {
      const response = await fetch(
        `https://pumpportal.fun/api/trade?api-key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "buy",
            mint: buyForm.mint,
            amount: amount,
            denominatedInSol: "true",
            slippage: Number(buyForm.slippage),
            priorityFee: Number(buyForm.priorityFee),
            pool: buyForm.pool,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Transaction failed");
      }
      setResponse((prev) => ({ ...prev, buy: data }));
      setBuyForm((prev) => ({ ...prev, amount: amount.toString() }));
    } catch (err) {
      setError((prev) => ({ ...prev, buy: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, buy: false }));
    }
  };

  const executePresetSell = async (percentage) => {
    if (!sellForm.mint) {
      setError((prev) => ({
        ...prev,
        sell: "Please enter a token contract address",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, sell: true }));
    setError((prev) => ({ ...prev, sell: null }));
    setResponse((prev) => ({ ...prev, sell: null }));

    try {
      const response = await fetch(
        `https://pumpportal.fun/api/trade?api-key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "sell",
            mint: sellForm.mint,
            amount: percentage,
            denominatedInSol: "false",
            slippage: Number(sellForm.slippage),
            priorityFee: Number(sellForm.priorityFee),
            pool: sellForm.pool,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Transaction failed");
      }
      setResponse((prev) => ({ ...prev, sell: data }));
      setSellForm((prev) => ({ ...prev, amount: percentage }));
    } catch (err) {
      setError((prev) => ({ ...prev, sell: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, sell: false }));
    }
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    const formData = action === "buy" ? buyForm : sellForm;
    setLoading((prev) => ({ ...prev, [action]: true }));
    setError((prev) => ({ ...prev, [action]: null }));
    setResponse((prev) => ({ ...prev, [action]: null }));

    try {
      const response = await fetch(
        `https://pumpportal.fun/api/trade?api-key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            mint: formData.mint,
            amount:
              formData.denominatedInSol === "true"
                ? Number(formData.amount)
                : formData.amount,
            denominatedInSol: formData.denominatedInSol,
            slippage: Number(formData.slippage),
            priorityFee: Number(formData.priorityFee),
            pool: formData.pool,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Transaction failed");
      }
      setResponse((prev) => ({ ...prev, [action]: data }));
    } catch (err) {
      setError((prev) => ({ ...prev, [action]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const renderBuyForm = () => (
    <form onSubmit={(e) => handleSubmit(e, "buy")} className="trade-form">
      <div className="form-group">
        <label>Token Contract Address</label>
        <input
          type="text"
          name="mint"
          value={buyForm.mint}
          onChange={(e) => handleInputChange(e, "buy")}
          placeholder="Enter token contract address"
          required
        />
      </div>

      <div className="form-group">
        <label>Amount (SOL)</label>
        <div className="preset-buttons">
          {BUY_PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`preset-button ${
                buyForm.amount === amount.toString() ? "active" : ""
              } ${loading.buy ? "disabled" : ""}`}
              onClick={() => executePresetBuy(amount)}
              disabled={loading.buy}
            >
              {loading.buy && buyForm.amount === amount.toString()
                ? "Buying..."
                : `${amount} SOL`}
            </button>
          ))}
        </div>
        <input
          type="number"
          name="amount"
          value={buyForm.amount}
          onChange={(e) => handleInputChange(e, "buy")}
          placeholder="Custom amount in SOL"
          step="0.000001"
          min="0"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Slippage (%)</label>
          <input
            type="number"
            name="slippage"
            value={buyForm.slippage}
            onChange={(e) => handleInputChange(e, "buy")}
            min="0"
            step="0.1"
            required
          />
        </div>

        <div className="form-group">
          <label>Priority Fee</label>
          <input
            type="number"
            name="priorityFee"
            value={buyForm.priorityFee}
            onChange={(e) => handleInputChange(e, "buy")}
            min="0"
            step="0.001"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Pool</label>
        <select
          name="pool"
          value={buyForm.pool}
          onChange={(e) => handleInputChange(e, "buy")}
        >
          <option value="pump">Pump</option>
          <option value="raydium">Raydium</option>
        </select>
      </div>

      <button type="submit" disabled={loading.buy} className="submit-button">
        {loading.buy ? "Processing buy..." : "Execute Buy"}
      </button>

      {error.buy && <div className="alert error">{error.buy}</div>}

      {response.buy && (
        <div className="alert success">
          <div>Transaction successful!</div>
          <div className="signature-container">
            <span className="signature-label">Signature: </span>
            <a
              href={`https://solscan.io/tx/${response.buy.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="signature-link"
            >
              {response.buy.signature}
            </a>
          </div>
        </div>
      )}
    </form>
  );

  const renderSellForm = () => (
    <form onSubmit={(e) => handleSubmit(e, "sell")} className="trade-form">
      <div className="form-group">
        <label>Token Contract Address</label>
        <input
          type="text"
          name="mint"
          value={sellForm.mint}
          onChange={(e) => handleInputChange(e, "sell")}
          placeholder="Enter token contract address"
          required
        />
      </div>

      <div className="form-group">
        <label>Amount</label>
        <div className="preset-buttons">
          {SELL_PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`preset-button ${
                sellForm.amount === amount ? "active" : ""
              } ${loading.sell ? "disabled" : ""}`}
              onClick={() => executePresetSell(amount)}
              disabled={loading.sell}
            >
              {loading.sell && sellForm.amount === amount
                ? "Selling..."
                : amount}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Slippage (%)</label>
          <input
            type="number"
            name="slippage"
            value={sellForm.slippage}
            onChange={(e) => handleInputChange(e, "sell")}
            min="0"
            step="0.1"
            required
          />
        </div>

        <div className="form-group">
          <label>Priority Fee</label>
          <input
            type="number"
            name="priorityFee"
            value={sellForm.priorityFee}
            onChange={(e) => handleInputChange(e, "sell")}
            min="0"
            step="0.001"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Pool</label>
        <select
          name="pool"
          value={sellForm.pool}
          onChange={(e) => handleInputChange(e, "sell")}
        >
          <option value="pump">Pump</option>
          <option value="raydium">Raydium</option>
        </select>
      </div>

      <button type="submit" disabled={loading.sell} className="submit-button">
        {loading.sell ? "Processing sell..." : "Execute Sell"}
      </button>

      {error.sell && <div className="alert error">{error.sell}</div>}

      {response.sell && (
        <div className="alert success">
          <div>Transaction successful!</div>
          <div className="signature-container">
            <span className="signature-label">Signature: </span>
            <a
              href={`https://solscan.io/tx/${response.sell.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="signature-link"
            >
              {response.sell.signature}
            </a>
          </div>
        </div>
      )}
    </form>
  );

  return (
    <div className="container">
      <div className="trading-sections">
        <div className="trading-section">
          <div className="card">
            <div className="card-header">
              <h2>Buy Tokens</h2>
              <p>Execute buy orders for Pump.fun tokens</p>
            </div>
            <div className="card-content">{renderBuyForm()}</div>
          </div>
        </div>

        <div className="trading-section">
          <div className="card">
            <div className="card-header">
              <h2>Sell Tokens</h2>
              <p>Execute sell orders for Pump.fun tokens</p>
            </div>
            <div className="card-content">{renderSellForm()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
