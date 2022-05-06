import Input from './Input';
import Button from './Button';

const Rns = ({ registerRns, handleRnsParamsChange, rnsParams }) => {
  return (
    <div className="App__send">
      <p>Register for a human-readable address like satoshi.xrd</p>
      <Input
        name="name"
        placeholder="satoshi.xrd"
        type="text"
        value={rnsParams.name}
        onChange={handleRnsParamsChange}
      />
      <Input
        name="reserve_years"
        placeholder="Reserve Years"
        type="number"
        value={rnsParams.reserve_years}
        onChange={handleRnsParamsChange}
      />
      <Button title="Register RNS" handleOnClick={registerRns} />
    </div>
  );
};

export default Rns;
