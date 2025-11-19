/**
 * Input component.
 *
 * A small presentational input wrapper that forwards all provided props to the
 * underlying HTML `<input />` element while applying a set of default styles.
 *
 * @param {object} props - Props forwarded to the input element (e.g. `value`, `onChange`, `type`, `name`, etc.).
 * @returns {JSX.Element} The styled input element.
 */
const Input = ({ ...props }: any) => {
  return (
    <input
      {...props}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
    />
  );
};

export default Input;
