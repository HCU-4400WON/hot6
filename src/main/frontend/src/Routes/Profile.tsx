import {
  ref,
  getDownloadURL,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../firebase";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addLikePost,
  deleteLikePost,
  IPost,
  IUser,
  memberDelete,
  memberProfile,
  memberUpdate,
  posts,
} from "api";
import { AxiosError, AxiosResponse } from "axios";
import {
  isDeleteModalState,
  isLoginModalState,
  isLoginState,
} from "components/atom";
import DeletePopup from "components/DeleteModal";
import LoadingAnimation from "components/LoadingAnimation";
import { AnimatePresence, motion } from "framer-motion";
import { userInfo } from "os";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useMatch } from "react-router";
import { Navigate, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import tw from "tailwind-styled-components";

const Sidebar = tw.div`
hidden
bg-gray-100
lg:flex
min-w-[220px] 
pl-[30px]
border-r-2
border-t-2
border-gray-200
border-b-2
min-h-screen
flex-col
items-start

`;

const SidebarTitle = tw.p`
py-[40px] 
text-[30px] 
font-unique
`;

const SidebarItemText = tw.button`
font-unique
text-[15px]
mb-[20px]

hover:scale-110
hover:text-gray-400
`;

const ProfileInfoRow = tw.div`
  w-full
  flex
  my-[10px]
  h-auto
  items-center
  text-[13px]
  lg:text-[17px]
`;

const ProfileInfoBox = tw.div`
flex 
items-center 
w-[110px]
lg:w-[180px]

`;

const ProfileInfoTitle = tw.p`
w-[150px] 
text-gray-500
font-medium
`;

const ProfileInfoIcon = tw.i`
text-gray-600
mr-2
`;

const ProfileInfoContent = tw.span`
min-w-[230px]
md:min-w-[300px]
font-main


`;

const ProfileBanner = tw.form`
shadow-md
my-[40px] 
rounded-xl 
bg-[#f2f2f2] 
p-[40px] 
flex
flex-col
md:flex-row
items-center
md:items-start

`;

const PostGrid = tw.div`

gap-20
p-10
flex
white
whitespace-nowrap
overflow-scroll
justify-start
mt-[0px]
mb-[80px]

`;

// const PostGrid = tw.div`
// grid
// grid-cols-1
// sm:grid-cols-2
// xl:grid-cols-4
// pb-[100px]
// `;

const PostItem = tw(motion.div)`
relative
justify-self-center
h-[210px] 
min-w-[330px]
rounded-md
overflow-hidden
shadow-lg
`;

const PostImage = tw.div`
border-0 
rounded-sm 
h-2/5 
mx-5 
mt-5 
mb-3 
`;

const PostContentFirstRow = tw.div`
flex 
justify-between
items-center
bg-gray-500
p-[15px]
`;

const PostCategorySpan = tw.span`
text-[#185ee4] 
bg-[#fff] 
h-[25px] 
border 
w-[80px] 
text-[15px] 
font-bold 
rounded-full 
flex 
items-center 
justify-center
`;

const PostCategoryLabel = tw.label`
`;

const HeartIcon = tw(motion.i)`
`;

const PostMainPart = tw.div`
bg-[#e9e9eb] 
w-full 
h-full 
px-[25px] 
py-[15px]
`;

const PostTitle = tw.p`
text-lg
font-unique
`;
const PostDate = tw.div`
flex text-[12px] 
font-semibold 
items-center
`;

const PostDatePlan = tw.p``;
const PostDateStart = tw.p``;

const PostPerson = tw.div`
absolute 
left-[25px] 
bottom-[15px] 
flex 
items-center 
gap-2
`;

const PostPersonTotal = tw.p`
text-[#185ee4] 
font-bold 
text-[14px]
`;

const PostPersonPosition = tw.span`
border-gray-400 
border 
rounded-full 
px-[10px] 
text-[11px] 
text-gray-500 
font-medium
`;

const ValidationVariant = {
  hidden: {
    y: -10,
    color: "red",
    opacity: 0,
  },

  showing: {
    y: 0,
    opacity: 1,
  },

  exit: {
    y: 10,
    opacity: 0,
  },
};

const PostItemVariant = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  showing: {
    scale: 1,
    opacity: 1,
  },
  hidden: {
    scale: 0,
    opacity: 0,
  },
};

function Profile() {
  const location = useLocation();
  console.log(location);

  const [onSuccessLoading, setOnSuccessLoading] = useState(true);

  const {
    isLoading: getUserLoading,
    data,
    refetch,
  } = useQuery<IUser>(
    ["User", location.state ? location.state.user.nickname : "me"],
    memberProfile,
    {
      onSuccess: async (data) => {
        if (!location.state) {
          setLinks([...(data?.externalLinks as string[])]);
        } else {
          const newData: IUser = location.state.user;
          data.bio = newData.bio;
          data.club = newData.club;
          data.contact = newData.contact;
          data.department = newData.department;
          data.email = newData.email;
          // data.externalLinks = newData.externalLinks;
          data.grade = newData.grade;
          data.isPublic = newData.isPublic;
          data.likes = newData.likes;
          data.nickname = newData.nickname;
          data.pictureUrl = newData.pictureUrl;
          data.position = newData.position;
          data.posts = newData.posts;

          setLinks([...(location.state.user?.externalLinks as string[])]);
        }

        setValue("nickname", data.nickname);
        setValue("pictureUrl", data.pictureUrl);
        setValue("department", data.department);
        setValue("position", data.position);
        setValue("contact", data.contact);
        setValue("club1", data.club?.at(0));
        setValue("club2", data.club?.at(1));
        setValue("bio", data.bio);

        setOnSuccessLoading(false);
      },
      onError: (error) => {
        if (((error as AxiosError).response as AxiosResponse).status === 401) {
          alert("???????????? ???????????????.");
          setIsLoginModal(true);
          setIsLogin(false);
          if (localStorage.getItem("key")) localStorage.removeItem("key");
          navigate("/");
        }
      },
    }
  );

  const [nowModifying, setNowModifying] = useState(false);

  const navigate = useNavigate();

  const onClick = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (event.currentTarget.id === "modify") {
      setNowModifying((prev) => !prev);
    } else if (event.currentTarget.id === "delete") {
      setIsDeleteModal(true);
    }
  };

  const { mutate: deleteMemberMutate, isLoading: deleteMemberLoading } =
    useMutation(
      ["deleteMember" as string],

      () => memberDelete() as any,

      {
        onSuccess: () => {},
        onError: () => {
          console.log("?????? ????????? ???????????? ????????????.");
        },
      }
    );

  const { register, handleSubmit, formState, setValue, getValues } = useForm();

  const [Links, setLinks] = useState<string[]>([]);
  const [externalLink, setExternalLink] = useState<string>("");
  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    setExternalLink(event.currentTarget.value);
  };
  const onDelete = (link: string) => {
    const idx = Links.findIndex((elem) => elem === link);
    setLinks((prev) => [...prev.slice(0, idx), ...prev.slice(idx + 1)]);
  };
  const onClickPlus = () => {
    setLinks((prev) => [...prev, externalLink]);
    setExternalLink("");
  };

  interface Idata {
    nickname: string;
    department: string;
    position: string;
    grade: string;
    contact: string;
    bio: string;
    club1: string;
    club2: string;
    pictureUrl: string;
  }

  const onValid = async (newData: Idata) => {
    console.log(formState.errors);
    console.log("before", newData);

    let arr = new Array<string>();
    if (newData.club1) arr.push(newData.club1);
    if (newData.club2) arr.push(newData.club2);

    const newUser = {
      nickname: newData.nickname,
      pictureUrl:
        newData.pictureUrl.slice(5, 13) !== "position"
          ? newData.pictureUrl
          : newData.position === "??????"
          ? "/img/position4.png"
          : newData.position === "?????????"
          ? "/img/position3.png"
          : newData.position === "????????????"
          ? "/img/position2.png"
          : "/img/position1.png",
      isPublic: true,
      department: newData.department,
      position: newData.position,
      bio: newData.bio,
      grade: newData.grade,
      // club: [
      //   newData.club1 === undefined,
      //   newData.club2 === false newData.club2,
      // ],
      club: arr,
      contact: newData?.contact,
      externalLinks: Links,
    };

    await memberUpdate(newUser as any);
    setNowModifying(false);
    refetch();
  };

  const onSidebarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const {
      currentTarget: { id },
    } = event;
    if (id === "1") {
      window.scrollTo(
        (document.querySelector("#profileInfo") as HTMLElement).offsetLeft,
        (document.querySelector("#profileInfo") as HTMLElement).offsetTop
      );
    } else if (id === "2") {
      window.scrollTo(
        (document.querySelector("#myPost") as HTMLElement).offsetLeft,
        (document.querySelector("#myPost") as HTMLElement).offsetTop
      );
    } else if (id === "3") {
      window.scrollTo(
        (document.querySelector("#zzim") as HTMLElement).offsetLeft,
        (document.querySelector("#zzim") as HTMLElement).offsetTop
      );
    } else if (id === "4") {
      window.scrollTo(
        (document.querySelector("#delete") as HTMLElement).offsetLeft,
        (document.querySelector("#delete") as HTMLElement).offsetTop
      );
    }
  };

  const [isDeleteModal, setIsDeleteModal] = useRecoilState(isDeleteModalState);

  const { mutate: likeAddMutate, isLoading: isLikeAddLoading } = useMutation(
    ["likeAddMutate" as string],
    (postId: number) => addLikePost(postId) as any,
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        if (((error as AxiosError).response as AxiosResponse).status === 401) {
          alert("???????????? ???????????????.");
          setIsLoginModal(true);
          setIsLogin(false);
          if (localStorage.getItem("key")) localStorage.removeItem("key");
          navigate("/");
        }
      },
    }
  );

  const { mutate: likeDeleteMutate, isLoading: isLikeDeleteLoading } =
    useMutation(
      ["likeDeleteMutate" as string],
      (postId: number) => deleteLikePost(postId) as any,
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          if (
            ((error as AxiosError).response as AxiosResponse).status === 401
          ) {
            alert("???????????? ???????????????.");
            setIsLoginModal(true);
            setIsLogin(false);
            if (localStorage.getItem("key")) localStorage.removeItem("key");
            navigate("/");
          }
        },
      }
    );

  const onHeartClick = async (postId: number, hasLiked: boolean) => {
    if (hasLiked) {
      likeDeleteMutate(postId);
    } else {
      likeAddMutate(postId);
    }
  };

  const matchProfile = useMatch("/profile");
  const setIsLogin = useSetRecoilState(isLoginState);
  const setIsLoginModal = useSetRecoilState(isLoginModalState);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const onUploadImageButtonClick = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.click();
  }, []);

  const onImageChange = (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    e.preventDefault();
    const file = e.target.files;
    if (!file) return null;

    const storageRef = ref(storage, `files/${file[0].name}`);
    const uploadTask = uploadBytesResumable(storageRef, file[0]);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        // setProgressPercent(progress);
      },
      (error) => {
        switch (error.code) {
          case "storage/canceld":
            alert("Upload has been canceled");
            break;
        }
      },
      () => {
        e.target.value = "";
        getDownloadURL(storageRef).then((downloadURL) => {
          console.log("File available at", downloadURL);
          setImageURL(downloadURL);
          setValue("pictureUrl", downloadURL);
          (
            document.querySelector("#basicImage") as HTMLElement
          ).style.backgroundColor = "white";
          (document.querySelector("#basicImage") as HTMLElement).style.color =
            "black";
          //   setImage(downloadURL);
        });
      }
    );
  };
  const [imageURL, setImageURL] = useState<string>("");
  const onBasicImageClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "black";
    e.currentTarget.style.color = "white";

    setValue("pictureUrl", "/img/position4.png");
  };
  return (
    <>
      {onSuccessLoading || getUserLoading || deleteMemberLoading ? (
        <LoadingAnimation />
      ) : (
        <>
          {isDeleteModal ? <DeletePopup /> : null}
          <div className="flex">
            <Sidebar>
              <SidebarTitle>My profile</SidebarTitle>
              <SidebarItemText onClick={onSidebarClick} id="1">
                ????????? ??????
              </SidebarItemText>

              <SidebarItemText onClick={onSidebarClick} id="2">
                ?????? ??? ?????????
              </SidebarItemText>
              <SidebarItemText onClick={onSidebarClick} id="3">
                ?????? ?????????
              </SidebarItemText>
              <SidebarItemText onClick={onSidebarClick} id="4">
                ????????????
              </SidebarItemText>
            </Sidebar>
            <div className="px-[50px] w-full min-w-[530px] lg:w-5/6 border-t-2 border-b-2 border-gray-200 ">
              <ProfileBanner
                id="profileInfo"
                className="relative"
                onSubmit={handleSubmit(onValid as any)}
              >
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  ref={inputRef}
                  // onChange={onUploadImage}
                  onChange={onImageChange}
                />
                {nowModifying && (
                  <div className="absolute items-center justify-between flex left-[30px] top-[20px] w-[90%] md:w-[190px]">
                    <i
                      className="fa-solid fa-panorama w-[40px]"
                      onClick={onUploadImageButtonClick}
                    ></i>
                    <button
                      id="basicImage"
                      className=" text-[10px] border-[2px] font-bold px-2 rounded-md border-black"
                      onClick={onBasicImageClick}
                    >
                      ?????? ?????????
                    </button>
                  </div>
                )}

                <div className="w-[120px] flex flex-col items-center ">
                  {nowModifying ? (
                    <img
                      className="w-[100%] h-[120px] border border-black rounded-full my-[10px]"
                      src={getValues("pictureUrl")}
                    ></img>
                  ) : (
                    <img
                      src={data?.pictureUrl}
                      className="w-[100%] h-[120px] border-black rounded-full my-[10px]"
                    />
                  )}

                  {nowModifying ? (
                    <div className="flex flex-col justify-start items-center">
                      <input
                        type="text"
                        placeholder="?????????"
                        {...register("nickname", {
                          required: "?????? ?????? ?????????",
                          maxLength: {
                            value: 10,
                            message: "10??? ????????? ???????????????",
                          },
                        })}
                        className="mt-[10px] text-[17px] px-[10px] w-[150px] rounded-md border-2 border-gray-200"
                      />

                      <AnimatePresence>
                        {(formState.errors.nickname?.message as string) && (
                          <motion.span
                            variants={ValidationVariant}
                            className="text-xs my-auto mt-2"
                            initial="hidden"
                            animate="showing"
                            exit="exit"
                          >
                            * {formState.errors.nickname?.message as string}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-[150px] mt-[10px]">
                      {/* <span className="flex items-center ">
                        <i className="fa-solid fa-user text-gray-600  w-[18px] mr-[2px]"></i>
                        <p className="mr-[10px] text-gray-500 font-semibold">
                          ?????????
                        </p>
                      </span> */}

                      <span className=" text-[17px] font-semibold text-gray-500 bg-white px-[20px]">
                        <i className="fa-solid fa-user mr-[10px] text-gray-600"></i>
                        {data?.nickname}
                      </span>
                    </div>
                  )}
                </div>
                <div className="md:pl-[70px] w-full text-[17px] flex flex-col justify-between mt-[20px] md:mt-[0px]">
                  <ProfileInfoRow>
                    <ProfileInfoBox>
                      <ProfileInfoIcon className="fa-solid fa-graduation-cap"></ProfileInfoIcon>
                      <ProfileInfoTitle>??????</ProfileInfoTitle>
                    </ProfileInfoBox>
                    {nowModifying ? (
                      <select
                        className="border-2 h-[35px] px-2 rounded-lg"
                        {...register("department")}
                      >
                        <option>????????????????????????</option>
                        <option>??????????????????</option>
                        <option>??????????????????</option>
                        <option>?????????</option>
                        <option>????????????????????????</option>
                        <option>??????????????????????????????</option>
                        <option>?????????????????????</option>
                        <option>??????????????????????????????</option>
                        <option>???????????????</option>
                        <option>?????????????????????</option>
                        <option>??????????????????????????????</option>
                        <option>ICT????????????</option>
                        <option>AI???????????????</option>
                        <option>?????????????????????</option>
                      </select>
                    ) : (
                      <ProfileInfoContent>
                        {data?.department}
                      </ProfileInfoContent>
                    )}
                  </ProfileInfoRow>
                  <ProfileInfoRow>
                    <ProfileInfoBox>
                      <ProfileInfoIcon className="fa-solid fa-wand-magic-sparkles"></ProfileInfoIcon>
                      <ProfileInfoTitle>?????????</ProfileInfoTitle>
                    </ProfileInfoBox>
                    {nowModifying ? (
                      <select
                        className="border-2 h-[35px] px-2 rounded-lg"
                        {...register("position")}
                      >
                        <option>??????</option>
                        <option>?????????</option>
                        <option>?????????</option>
                        <option>????????????</option>
                      </select>
                    ) : (
                      <ProfileInfoContent>{data?.position}</ProfileInfoContent>
                    )}
                  </ProfileInfoRow>
                  <ProfileInfoRow>
                    <ProfileInfoBox>
                      <ProfileInfoIcon className="fa-solid fa-stairs"></ProfileInfoIcon>
                      <ProfileInfoTitle>??????</ProfileInfoTitle>
                    </ProfileInfoBox>
                    {nowModifying ? (
                      <select
                        className="border-2 h-[35px] px-2 rounded-lg"
                        {...register("grade")}
                      >
                        <option>1??????</option>
                        <option>2??????</option>
                        <option>3??????</option>
                        <option>4??????</option>
                      </select>
                    ) : (
                      <ProfileInfoContent>{data?.grade}</ProfileInfoContent>
                    )}
                  </ProfileInfoRow>

                  <ProfileInfoRow>
                    <ProfileInfoBox>
                      <ProfileInfoIcon className="fa-regular fa-id-card"></ProfileInfoIcon>

                      <ProfileInfoTitle>????????????</ProfileInfoTitle>
                    </ProfileInfoBox>
                    <ProfileInfoContent>
                      {nowModifying ? (
                        <div>
                          <input
                            className="border-2 h-[35px] px-2 rounded-lg w-[200px] lg:w-[300px] xl:w-[400px]"
                            type="text"
                            {...register("contact", {
                              required: "?????? ?????? ?????????",
                              maxLength: {
                                value: 30,
                                message: "?????? ?????????.",
                              },
                            })}
                            placeholder="Ex) ?????? ?????? , ????????? , ?????? ????????? ???"
                          />
                          <AnimatePresence>
                            {(formState.errors.contact?.message as string) && (
                              <motion.span
                                variants={ValidationVariant}
                                className="text-xs ml-3"
                                initial="hidden"
                                animate="showing"
                                exit="exit"
                              >
                                * {formState.errors.contact?.message as string}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <ProfileInfoContent>{data?.contact}</ProfileInfoContent>
                      )}
                    </ProfileInfoContent>
                  </ProfileInfoRow>

                  <ProfileInfoRow className="items-start">
                    <ProfileInfoBox>
                      <ProfileInfoIcon className="fa-solid fa-circle-nodes "></ProfileInfoIcon>

                      <ProfileInfoTitle>????????? / ??????</ProfileInfoTitle>
                    </ProfileInfoBox>

                    {nowModifying ? (
                      <div className="flex flex-col ">
                        <input
                          {...register(`club1`)}
                          className="border-2 h-[35px] px-2 mb-[10px] rounded-lg w-[200px] lg:w-[300px] xl:w-[400px]"
                          placeholder="?????? 2???"
                          type="text"
                          maxLength={20}
                        />

                        <input
                          {...register(`club2`)}
                          className="border-2 h-[35px] px-2 rounded-lg w-[200px] lg:w-[300px] xl:w-[400px]"
                          placeholder="?????? 2???"
                          type="text"
                          maxLength={20}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {data?.club?.map((elem, index) =>
                          data?.club?.at(index) === "" ? null : (
                            <ProfileInfoContent
                              className="flex relative items-center justify-center bg-gray-200 my-1 py-[3px] px-[10px]"
                              key={index}
                            >
                              <ProfileInfoIcon className="absolute left-2 fa-solid fa-circle-nodes "></ProfileInfoIcon>
                              <p>{elem}</p>
                            </ProfileInfoContent>
                          )
                        )}
                      </div>
                    )}

                    {/* 
                  <ProfileInfoContent>
                    {nowModifying ? (
                      <input
                        {...register("club1")}
                        className="border-2 h-[30px] px-2 rounded-lg w-[400px]"
                        defaultValue={data?.club}
                        type="text"
                      />
                    ) : (
                      <ProfileInfoContent>{data?.club}</ProfileInfoContent>
                    )}
                  </ProfileInfoContent> */}
                  </ProfileInfoRow>

                  <ProfileInfoRow className=" items-start mb-0 mt-[8px]">
                    <ProfileInfoBox>
                      <ProfileInfoIcon className="fa-solid fa-link"></ProfileInfoIcon>
                      <ProfileInfoTitle className="">????????????</ProfileInfoTitle>
                    </ProfileInfoBox>

                    {nowModifying ? (
                      <div>
                        <div className="flex items-center">
                          <input
                            className="border-2 px-2 rounded-lg w-[200px] lg:w-[300px] xl:w-[400px] h-[35px]"
                            value={externalLink}
                            onChange={onChange}
                            placeholder="ex) github or Linked-In"
                            maxLength={30}
                          />
                          <i
                            onClick={onClickPlus}
                            className="fa-solid fa-plus text-[20px] relative right-7"
                          ></i>
                        </div>

                        {Links.length !== 0 &&
                          Links?.map((link) => (
                            <div className="flex items-center justify-between bg-slate-200 px-[10px] w-[200px] lg:w-[300px] xl:w-[400px]  h-[30px] mt-[10px]">
                              <i className="fa-solid fa-link"></i>
                              <p>{link} </p>
                              <i
                                className="fa-regular fa-trash-can"
                                onClick={() => onDelete(link)}
                              ></i>
                            </div>
                          ))}

                        {/* {data?.externalLinks?.map((link, index) => (
                      <ProfileInfoContent key={index}>
                        {link}
                      </ProfileInfoContent>
                    ))} */}
                      </div>
                    ) : (
                      <div className="flex flex-col ">
                        {Links?.map((link) => (
                          <div className="relative flex items-center justify-center w-[230px] md:min-w-[300px] bg-slate-200 h-[30px] mb-[10px]">
                            <i className="fa-solid fa-link absolute left-2"></i>
                            <p>{link} </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ProfileInfoRow>
                  <ProfileInfoRow
                    className={`${nowModifying && "mt-[20px]"} items-start`}
                  >
                    <ProfileInfoBox className="">
                      <ProfileInfoIcon className="fa-solid fa-rocket"></ProfileInfoIcon>
                      <ProfileInfoTitle>????????????</ProfileInfoTitle>
                    </ProfileInfoBox>
                    <ProfileInfoContent>
                      {nowModifying ? (
                        <textarea
                          {...register("bio")}
                          className="border-2 p-2 rounded-lg w-[200px] lg:w-[300px] xl:w-[400px] h-[100px]"
                          placeholder="???????????? ?????? ???????????? !"
                          maxLength={150}
                        ></textarea>
                      ) : (
                        <ProfileInfoContent>{data?.bio}</ProfileInfoContent>
                      )}
                    </ProfileInfoContent>
                  </ProfileInfoRow>
                  <div className="flex justify-center md:justify-end ">
                    {!location.state &&
                      (nowModifying ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              refetch();
                              setNowModifying(false);
                            }}
                            className="mb-[40px]  rounded-full border-2 border-red-500 text-red-500 w-[80px] bg-white text-[13px] mt-[20px] md:text-[17px] md:w-[120px] md:h-[30px] h-[25px] "
                          >
                            {" "}
                            ????????????{" "}
                          </button>
                          <button
                            id="modify"
                            className="bg-[#fff] ml-2 w-[80px] text-[13px] mt-[20px] md:text-[17px] md:w-[120px] md:h-[30px] h-[25px] border-2 shadow  rounded-full text-gray-500 border-gray-400"
                          >
                            ????????????
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            id="modify"
                            onClick={onClick}
                            className="bg-[#fff] w-[80px] text-[13px] mt-[10px] md:mt-[0px] md:text-[17px] md:w-[120px] md:h-[30px] h-[25px] border-2 shadow rounded-full  text-gray-500 border-gray-400"
                          >
                            ????????????
                          </button>
                        </>
                      ))}
                  </div>
                </div>
              </ProfileBanner>

              <span className="mt-[40px] text-[20px] font-medium flex items-center">
                <i className="fa-solid fa-pencil mr-2"> </i>
                <p className="font-bold font-unique">?????? ??? ?????????</p>
              </span>

              <PostGrid id="myPost">
                {(data?.posts as IPost[]).map((post, index) => (
                  <PostItem
                    // initial={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                    key={index}
                    // style={{ boxShadow: "0px 0px 25px rgb(0 0 0 / 0.25)" }}
                  >
                    <PostContentFirstRow
                      className={`${
                        post.dtype === "P"
                          ? "bg-[#e0c3f8]"
                          : post.dtype === "S"
                          ? "bg-[#c7c7c7]"
                          : "bg-[#bdc9f2]"
                      }`}
                    >
                      <PostCategorySpan>
                        <PostCategoryLabel
                          className={`${
                            post.dtype === "P"
                              ? "text-purple-400"
                              : post.dtype === "S"
                              ? "text-gray-400"
                              : "text-blue-400"
                          } `}
                        >
                          {post.dtype === "P"
                            ? "????????????"
                            : post.dtype === "S"
                            ? "?????????"
                            : "?????????"}
                        </PostCategoryLabel>
                      </PostCategorySpan>

                      <div>
                        <HeartIcon
                          whileHover={{ scale: [1, 1.3, 1, 1.3, 1] }}
                          whileTap={{ y: [0, -30, 0] }}
                          onClick={() =>
                            onHeartClick(post.id, post.hasLiked as boolean)
                          }
                          className={`${
                            post.hasLiked
                              ? "fa-solid fa-heart text-red-600"
                              : "fa-regular fa-heart"
                          }`}
                        >
                          {/* {post.likenum} */}
                        </HeartIcon>
                        &nbsp; {post?.nliked}
                      </div>
                      {/* <svg
                width="15px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  stroke="1"
                  d="M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z"
                />
              </svg> */}
                      {/* <p className="mx-5 my-1 text-sm font-bold">?????????</p>
       <p className="text-sm text-blue-500">{post.total}??? ??????</p> */}
                    </PostContentFirstRow>
                    <Link to={`/post/${post.id}`}>
                      <PostMainPart>
                        {/* secondRow */}
                        <PostTitle>
                          {post.title.length > 16
                            ? post.title.slice(0, 16) + " ..."
                            : post.title}
                        </PostTitle>

                        {/* ThirdRow */}
                        <PostDate>
                          {(new Date(post.projectEnd).getTime() -
                            new Date(post.projectStart).getTime()) /
                            (1000 * 24 * 60 * 60) >=
                          365 ? (
                            <PostDatePlan>
                              {Math.floor(
                                (new Date(post.projectEnd).getTime() -
                                  new Date(post.projectStart).getTime()) /
                                  (1000 * 24 * 60 * 60 * 365)
                              )}
                              {""}??? ??????
                            </PostDatePlan>
                          ) : (new Date(post.projectEnd).getTime() -
                              new Date(post.projectStart).getTime()) /
                              (1000 * 24 * 60 * 60) >=
                            30 ? (
                            <PostDatePlan>
                              {Math.floor(
                                (new Date(post.projectEnd).getTime() -
                                  new Date(post.projectStart).getTime()) /
                                  (1000 * 24 * 60 * 60 * 30)
                              )}
                              {""}??? ??????
                            </PostDatePlan>
                          ) : (new Date(post.projectEnd).getTime() -
                              new Date(post.projectStart).getTime()) /
                              (1000 * 24 * 60 * 60) >=
                            7 ? (
                            <PostDatePlan>
                              {Math.floor(
                                (new Date(post.projectEnd).getTime() -
                                  new Date(post.projectStart).getTime()) /
                                  (1000 * 24 * 60 * 60 * 7)
                              )}
                              {""}??? ??????
                            </PostDatePlan>
                          ) : (
                            <PostDatePlan>
                              {Math.floor(
                                (new Date(post.projectEnd).getTime() -
                                  new Date(post.projectStart).getTime()) /
                                  (1000 * 24 * 60 * 60)
                              )}
                              {""}??? ??????
                            </PostDatePlan>
                          )}
                          <p className="mx-[7px] pb-0.5">|</p>
                          <PostDateStart>
                            {" "}
                            {new Date(post.projectStart).getMonth()}???{" "}
                            {new Date(post.projectStart).getDate()}??? ??????
                          </PostDateStart>
                        </PostDate>

                        {/* lastRow */}
                        <PostPerson>
                          <PostPersonTotal>
                            {post.dtype === "P"
                              ? post.maxDesigner +
                                post.maxDeveloper +
                                post.maxPlanner
                              : post.dtype === "S"
                              ? post.maxMember
                              : post.maxMentee + post.maxMentor}
                            ??? ??????
                          </PostPersonTotal>

                          {post.dtype === "P" ? (
                            <>
                              {post.maxDeveloper !== 0 && (
                                <PostPersonPosition>
                                  ????????? {post.maxDeveloper}???
                                </PostPersonPosition>
                              )}
                              {post.maxPlanner !== 0 && (
                                <PostPersonPosition>
                                  ????????? {post.maxPlanner}???
                                </PostPersonPosition>
                              )}

                              {post.maxDesigner !== 0 && (
                                <PostPersonPosition>
                                  ???????????? {post.maxDesigner}???
                                </PostPersonPosition>
                              )}
                            </>
                          ) : post.dtype === "S" ? (
                            post.maxMember !== 0 && (
                              <PostPersonPosition>
                                ???????????? {post.maxMember}???
                              </PostPersonPosition>
                            )
                          ) : (
                            <>
                              {post.maxMentor !== 0 && (
                                <PostPersonPosition>
                                  ?????? {post.maxMentor}???
                                </PostPersonPosition>
                              )}
                              {post.maxMentee !== 0 && (
                                <PostPersonPosition>
                                  ?????? {post.maxMentee}???
                                </PostPersonPosition>
                              )}
                            </>
                          )}
                        </PostPerson>
                      </PostMainPart>
                    </Link>
                  </PostItem>
                ))}
              </PostGrid>

              <span className="mt-[40px] text-[20px] font-medium flex items-center">
                <i className="fa-solid fa-heart text-red-600 mr-2"></i>
                <p className="font-bold font-unique">?????? ?????????</p>
              </span>

              <PostGrid id="zzim">
                <AnimatePresence>
                  {data?.likes?.map((post, index) => (
                    <PostItem
                      key={index}
                      variants={PostItemVariant}
                      initial="initial"
                      animate="showing"
                      exit="hidden"
                      // initial={{ scale: 1 }}
                      whileHover={{ scale: 1.08 }}

                      // style={{ boxShadow: "0px 0px 25px rgb(0 0 0 / 0.25)" }}
                    >
                      <PostContentFirstRow
                        className={`${
                          post.dtype === "P"
                            ? "bg-[#e0c3f8]"
                            : post.dtype === "S"
                            ? "bg-[#c7c7c7]"
                            : "bg-[#bdc9f2]"
                        }`}
                      >
                        <PostCategorySpan>
                          <PostCategoryLabel
                            className={`${
                              post.dtype === "P"
                                ? "text-purple-400"
                                : post.dtype === "S"
                                ? "text-gray-400"
                                : "text-blue-400"
                            } `}
                          >
                            {post.dtype === "P"
                              ? "????????????"
                              : post.dtype === "S"
                              ? "?????????"
                              : "?????????"}
                          </PostCategoryLabel>
                        </PostCategorySpan>
                        <div>
                          <HeartIcon
                            whileHover={{ scale: [1, 1.3, 1, 1.3, 1] }}
                            whileTap={{ y: [0, -30, 0] }}
                            onClick={() =>
                              onHeartClick(post.id, post.hasLiked as boolean)
                            }
                            className={`${
                              post.hasLiked
                                ? "fa-solid fa-heart text-red-600"
                                : "fa-regular fa-heart"
                            }`}
                          >
                            {/* {post.likenum} */}
                          </HeartIcon>
                          &nbsp; {post?.nliked}
                        </div>
                        {/* <svg
                width="15px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  stroke="1"
                  d="M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z"
                />
              </svg> */}
                        {/* <p className="mx-5 my-1 text-sm font-bold">?????????</p>
       <p className="text-sm text-blue-500">{post.total}??? ??????</p> */}
                      </PostContentFirstRow>
                      <Link to={`/post/${post.id}`}>
                        <PostMainPart>
                          {/* secondRow */}
                          <PostTitle>
                            {post.title.length > 16
                              ? post.title.slice(0, 16) + " ..."
                              : post.title}
                          </PostTitle>

                          {/* ThirdRow */}
                          <PostDate>
                            {(new Date(post.projectEnd).getTime() -
                              new Date(post.projectStart).getTime()) /
                              (1000 * 24 * 60 * 60) >=
                            365 ? (
                              <PostDatePlan>
                                {Math.floor(
                                  (new Date(post.projectEnd).getTime() -
                                    new Date(post.projectStart).getTime()) /
                                    (1000 * 24 * 60 * 60 * 365)
                                )}
                                {""}??? ??????
                              </PostDatePlan>
                            ) : (new Date(post.projectEnd).getTime() -
                                new Date(post.projectStart).getTime()) /
                                (1000 * 24 * 60 * 60) >=
                              30 ? (
                              <PostDatePlan>
                                {Math.floor(
                                  (new Date(post.projectEnd).getTime() -
                                    new Date(post.projectStart).getTime()) /
                                    (1000 * 24 * 60 * 60 * 30)
                                )}
                                {""}??? ??????
                              </PostDatePlan>
                            ) : (new Date(post.projectEnd).getTime() -
                                new Date(post.projectStart).getTime()) /
                                (1000 * 24 * 60 * 60) >=
                              7 ? (
                              <PostDatePlan>
                                {Math.floor(
                                  (new Date(post.projectEnd).getTime() -
                                    new Date(post.projectStart).getTime()) /
                                    (1000 * 24 * 60 * 60 * 7)
                                )}
                                {""}??? ??????
                              </PostDatePlan>
                            ) : (
                              <PostDatePlan>
                                {Math.floor(
                                  (new Date(post.projectEnd).getTime() -
                                    new Date(post.projectStart).getTime()) /
                                    (1000 * 24 * 60 * 60)
                                )}
                                {""}??? ??????
                              </PostDatePlan>
                            )}
                            <p className="mx-[7px] pb-0.5">|</p>
                            <PostDateStart>
                              {" "}
                              {new Date(post.projectStart).getMonth()}???{" "}
                              {new Date(post.projectStart).getDate()}??? ??????
                            </PostDateStart>
                          </PostDate>

                          {/* lastRow */}
                          <PostPerson>
                            <PostPersonTotal>
                              {post.dtype === "P"
                                ? post.maxDesigner +
                                  post.maxDeveloper +
                                  post.maxPlanner
                                : post.dtype === "S"
                                ? post.maxMember
                                : post.maxMentee + post.maxMentor}
                              ??? ??????
                            </PostPersonTotal>

                            {post.dtype === "P" ? (
                              <>
                                {post.maxDeveloper !== 0 && (
                                  <PostPersonPosition>
                                    ????????? {post.maxDeveloper}???
                                  </PostPersonPosition>
                                )}
                                {post.maxPlanner !== 0 && (
                                  <PostPersonPosition>
                                    ????????? {post.maxPlanner}???
                                  </PostPersonPosition>
                                )}

                                {post.maxDesigner !== 0 && (
                                  <PostPersonPosition>
                                    ???????????? {post.maxDesigner}???
                                  </PostPersonPosition>
                                )}
                              </>
                            ) : post.dtype === "S" ? (
                              post.maxMember !== 0 && (
                                <PostPersonPosition>
                                  ???????????? {post.maxMember}???
                                </PostPersonPosition>
                              )
                            ) : (
                              <>
                                {post.maxMentor !== 0 && (
                                  <PostPersonPosition>
                                    ?????? {post.maxMentor}???
                                  </PostPersonPosition>
                                )}
                                {post.maxMentee !== 0 && (
                                  <PostPersonPosition>
                                    ?????? {post.maxMentee}???
                                  </PostPersonPosition>
                                )}
                              </>
                            )}
                          </PostPerson>
                        </PostMainPart>
                      </Link>
                    </PostItem>
                  ))}
                </AnimatePresence>
              </PostGrid>

              {/* 
              <span className="text-[20px] font-semibold">??????????????????</span>

              <div className="my-[40px]">
                <div className="flex gap-10">
                  <span className="pt-[40px] flex flex-col w-1/2">
                    <label className="font-[16px] font-medium">
                      ????????? / ??????
                    </label>
                    <input
                      className="bg-[#eeeeee] rounded-full h-[30px] mt-[15px]"
                      type="text"
                    />
                  </span>

                  <span className="pt-[40px] flex flex-col w-1/2">
                    <label className="font-[16px] font-medium">
                      ????????? ??????
                    </label>
                    <input
                      className="bg-[#eeeeee] rounded-full h-[30px] mt-[15px]"
                      type="text"
                    />
                  </span>
                </div>

                <div className="flex gap-10">
                  <span className="pt-[40px] flex flex-col w-1/2">
                    <label className="font-[16px] font-medium">?????? ??????</label>
                    <input
                      className="bg-[#eeeeee] rounded-full h-[30px] mt-[15px]"
                      type="text"
                      placeholder="ex) ??????, ???????????? ???????????? ID..."
                    />
                  </span>

                  <span className="pt-[40px] flex flex-col w-1/2">
                    <label className="font-[16px] font-medium">????????????</label>
                    <input
                      className="bg-[#eeeeee] rounded-full h-[30px] mt-[15px]"
                      type="text"
                      placeholder="ex) Github, Instagram, Blog ..."
                    />
                  </span>
                </div>

                <div className="flex justify-end">
                  <button className=" mt-[40px] rounded-full border w-[130px] h-[30px]">
                    {" "}
                    ????????????{" "}
                  </button>
                </div>
              </div> */}
              {!location.state && (
                <button
                  onClick={onClick}
                  id="delete"
                  className="float-right mb-[40px] rounded-full border-2 border-red-500 text-red-500 w-[130px] h-[30px] "
                >
                  {" "}
                  ????????????{" "}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Profile;
