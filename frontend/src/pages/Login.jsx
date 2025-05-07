import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import loginIcon from "../assets/log-in.png";
import { useLoading } from "../contexts/LoadingContext";
import ErrorToast from "../components/ErrorToast";
import SuccessToast from "../components/SuccessToast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  async function submit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      showLoading();
      await signInWithEmailAndPassword(auth, email, pw);
      setSuccessMsg("Login successful");
      navigate("/");
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      hideLoading();
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />
      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <img
              src={loginIcon}
              alt="Login"
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Login
            </h2>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-2">Test Accounts:</p>
          <p>Hotel Manager: azzam.zafar@gmail.com / 123456</p>
          <p>Receptionist: ben@example.com / 123456</p>
          <p>Customer: mario@example.com / 123456</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark-light"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
