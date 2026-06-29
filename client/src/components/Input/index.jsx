import styles from './styles.module.css';

function Input({ type = 'text', name, placeholder, value, onChange }) {
  return (
    <input
      className={styles.input}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export default Input;
