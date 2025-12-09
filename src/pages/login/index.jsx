import Input from "../../components/Input/Input"; // Change path if needed

export default function Login() {
  return (
    <div>
      <h1>Welcome to the Login</h1>
      <p>This is the login page</p>

      <Input
        label="Large"
        type="large"
        placeholder="Placeholder text"
        helper="Optional helper text"
      />
      <Input
        label="Medium"
        type="medium"
        placeholder="Placeholder text"
        helper="Optional helper text"
      />
      <Input
        label="Small (Mobile)"
        type="small"
        placeholder="Placeholder text"
        helper="Optional helper text"
      />
    </div>
  );
}
