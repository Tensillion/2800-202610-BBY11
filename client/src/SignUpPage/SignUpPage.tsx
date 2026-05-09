import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";
import type { SyntheticEvent } from "react";

function SignUpPage() {
  const navigate = useNavigate();
  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) 
  {
  e.preventDefault();
  navigate("/pet");
  }
  
  return (
    <>
      <div>whatever SignUpPage page needs i guess</div>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
        <input type="text" name="username" placeholder="username"/>
        </label>
        <label>
          password:
        <input type="password" name="password" />
        </label>
        <input type="submit" value="Submit" />
      </form>

      <Footer />
    </>
  );
}
export default SignUpPage;
