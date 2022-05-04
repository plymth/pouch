const Input = ({ type, placeholder, name, value, onChange }) => {
  return (
    <div className="App__input">
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        max="999999999999999999"
      />
    </div>
  );
};

export default Input;
