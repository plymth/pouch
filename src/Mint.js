import Input from './Input';
import Button from './Button';

export const Mint = ({ token, handleTokenChange, loading, mint }) => {
  return (
    <div>
      {!loading && (
        <div className="App__send">
          <Input
            type="text"
            placeholder="Name"
            value={token.name}
            name="name"
            onChange={handleTokenChange}
          />
          <Input
            type="text"
            placeholder="Symbol"
            value={token.symbol}
            name="symbol"
            onChange={handleTokenChange}
          />
          <Input
            type="text"
            placeholder="Description"
            value={token.description}
            name="description"
            onChange={handleTokenChange}
          />

          <Input
            type="number"
            placeholder="Initial Supply"
            value={token.initial_supply}
            name="initial_supply"
            onChange={handleTokenChange}
          />
          <Button handleOnClick={mint} title="Mint" />
        </div>
      )}
    </div>
  );
};

export default Mint;
