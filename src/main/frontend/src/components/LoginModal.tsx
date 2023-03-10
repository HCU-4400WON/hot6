import { isLoginModalState } from "components/atom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { motion, AnimatePresence } from "framer-motion";

const LayoutVariant = {
  hidden: {
    opacity: 0,
    // backGroundColor: "rgba(0,0,0,0.5)",
  },
  showing: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

function Login() {
  const setIsLoginModal = useSetRecoilState(isLoginModalState);

  const onClick = (event: any) => {
    if (event.currentTarget.id === "no") {
      setIsLoginModal(false);
    }
  };

  return (
    <div className="flex w-full justify-center">
      <motion.div
        variants={LayoutVariant}
        initial="hidden"
        animate="showing"
        exit="exit"
        onClick={onClick}
        id="no"
        className="fixed z-10 bg-[rgba(0,0,0,0.5)] top-0 left-0 w-full h-screen"
      ></motion.div>

      <div className="w-4/5 rounded-2xl md:rounded-3xl fixed top-[150px] z-20 md:w-[940px] h-[480px] md:h-[540px] bg-[#fff] flex md:flex-row flex-col items-center  md:justify-evenly">
        <div className="flex items-center justify-center w-[400px] md:h-full md:mt-[0px] md:mb-[0px] mt-[50px] mb-[10px]">
          <img
            src="/img/loginLogo.png"
            className=" w-[250px] md:w-[350px]"
            // style={{
            //   // background:
            //   //   "radial-gradient(closest-side,#7b87e7, lightgray 80% , white)",
            //   backgroundImage:
            //     "radial-gradient(closest-side, #7b87e7, rgba(235, 235, 235, 0.13) 100%)",
            // }}
          />
          {/* <p className="text-[33px] font-semibold">Welcome to Dinner!</p> */}
        </div>
        <div className="flex md:flex-row flex-col items-center md:w-2/5 w-4/5  md:h-full relative">
          <div>
            <svg
              onClick={onClick}
              id="no"
              className="w-[16px] absolute right-[-30px] top-4 hidden md:block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z" />
            </svg>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="font-semibold text-[25px] mb-[10px]">Login</div>
            <div className=" text-[#757575] text-[15px] md:text-[18px] mt-3 mb-7">
              ???????????? ????????? ???????????? ?????? ???????????? ??? ?????????!
            </div>
            <div
              className="border-1-[#eff0f6] w-full h-[40px] flex items-center rounded-full mt-7 px-5"
              style={{ boxShadow: "0 2px 6px 0 rgba(19, 18, 66, 0.15)" }}
            >
              <img src="img/google.png" className="w-[20px] mr-3" />
              <a
                href="http://localhost:8080/oauth2/authorization/google"
                className="text-[17px]"
              >
                <span className="font-medium">Google</span> ???????????? ?????????
              </a>
            </div>

            {/* <div
            className="border-1-[#eff0f6] w-[310px] h-[34.6px] flex items-center rounded-full text-[14px] px-5 "
            style={{ boxShadow: "0 2px 6px 0 rgba(19, 18, 66, 0.15)" }}
          >
            ????????? ???????????????? &nbsp;
            <span className="font-bold"> ???????????? ??????</span>
          </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
