import { useQuery } from "@tanstack/react-query";
import { fakeUsers, IUser, readMembers } from "api";
import { isLoginModalState } from "components/atom";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import tw from "tailwind-styled-components";
import Login from "../components/LoginModal";

const Item = tw.div`
 h-[170px] 
 w-[270px]
 bg-[#f6f6f6]
 rounded-xl
 p-[10px]
`;

const StyledSidebar = tw.div`
w-[270px]
border-r

px-[20px]
pt-[20px] 
pb-[60px]
`;

const StyledFilterItem = tw.div`
mt-[50px]
`;

const StyledSpan = tw.span`
flex 
justify-between
`;

const StyledSubTitle = tw.p`
text-[20px] 
font-bold
`;
const StyledButton = tw.svg`
w-[16px]
`;

const Styledli = tw.li`
flex 
my-[10px]
`;

const Styledul = tw.ul`
`;

const StyledRadio = tw.input`
mr-3
`;

const StyledliText = tw.p`
text-[15px]
font-bold

`;

function Person() {
  const [showPositions, setShowPositions] = useState(true);
  const [showGrades, setShowGrades] = useState(true);
  const [showDepartments, setShowDepartments] = useState(true);

  const [position, setPosition] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);

  const onClick = (event: React.MouseEvent) => {
    const {
      currentTarget: { id },
    } = event;

    if (id === "포지션") {
      setShowPositions((prev) => !prev);
    } else if (id === "학년") {
      setShowGrades((prev) => !prev);
    } else if (id === "학부") {
      setShowDepartments((prev) => !prev);
    } else {
      if (
        (
          (event.currentTarget.parentElement as HTMLElement)
            .parentElement as HTMLElement
        ).id === "포지션ul"
      ) {
        setPosition(id);
      } else if (
        (
          (event.currentTarget.parentElement as HTMLElement)
            .parentElement as HTMLElement
        ).id === "학년ul"
      ) {
        setGrade(id);
      } else if (
        (
          (event.currentTarget.parentElement as HTMLElement)
            .parentElement as HTMLElement
        ).id === "학부ul"
      ) {
        setDepartment(id);
      }
    }
  };

  // const Users = fakeUsers;

  const TOTAL_POSTS = 200;
  const POSTS_PER_PAGE = 12;
  const TOTAL_PAGES = Math.ceil(TOTAL_POSTS / POSTS_PER_PAGE);
  const [nowPage, setNowPage] = useState(1);
  const [prevPage, setPrevPage] = useState(Math.floor((nowPage - 1) / 10) * 10);
  const [nextPage, setNextPage] = useState(Math.ceil(nowPage / 10) * 10 + 1);

  const onPageClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const {
      currentTarget: { id },
    } = event;
    if (id === "next") {
      if (nextPage <= TOTAL_PAGES) setNowPage(nextPage);
      else setNowPage(TOTAL_PAGES);
    } else if (id === "prev") {
      if (prevPage > 0) setNowPage(prevPage);
      else setNowPage(1);
    } else {
      setNowPage(+id);
    }
  };

  useEffect(() => {
    setNextPage(Math.ceil(nowPage / 10) * 10 + 1);
    setPrevPage(Math.floor((nowPage - 1) / 10) * 10);
    console.log(prevPage, nextPage);
  }, [nowPage]);

  const {
    data: Users,
    isLoading,
    refetch,
  } = useQuery<IUser[]>(["members"], () =>
    readMembers(nowPage, position, grade, department)
  );

  useEffect(() => {
    refetch();
    console.log(position, grade, department, nowPage);
  }, [position, grade, department, nowPage]);

  return (
    <div className="flex w-screen ">
      <StyledSidebar>
        <p className="text-[25px] font-bold">Filter</p>
        <StyledFilterItem>
          <StyledSpan>
            <StyledSubTitle>포지션</StyledSubTitle>

            <StyledButton
              id="포지션"
              onClick={onClick}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
            </StyledButton>
          </StyledSpan>
          {!showPositions ? null : (
            <Styledul id="포지션ul">
              <Styledli>
                <StyledRadio
                  name="포지션"
                  id="일반"
                  type="radio"
                  onClick={onClick}
                />
                <StyledliText>일반</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="포지션"
                  id="기획자"
                  type="radio"
                  onClick={onClick}
                />
                <StyledliText>기획자</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="포지션"
                  id="개발자"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>개발자</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="포지션"
                  id="디자이너"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>디자이너</StyledliText>
              </Styledli>
            </Styledul>
          )}
        </StyledFilterItem>

        <StyledFilterItem className="">
          <StyledSpan>
            <StyledSubTitle>학년</StyledSubTitle>
            <StyledButton
              id="학년"
              onClick={onClick}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
            </StyledButton>
          </StyledSpan>
          {!showGrades ? null : (
            <Styledul id="학년ul">
              <Styledli>
                <StyledRadio
                  name="학년"
                  id="1학년"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>1학년</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학년"
                  id="2학년"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>2학년</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학년"
                  id="3학년"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>3학년</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학년"
                  id="4학년"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>4학년</StyledliText>
              </Styledli>
            </Styledul>
          )}
        </StyledFilterItem>

        <StyledFilterItem className="">
          <StyledSpan>
            <StyledSubTitle>학부</StyledSubTitle>
            <StyledButton
              id="학부"
              onClick={onClick}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
            </StyledButton>
          </StyledSpan>

          {!showDepartments ? null : (
            <Styledul id="학부ul">
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="글로벌리더십학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>글로벌리더십학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="국제어문학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>국제어문학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="경영경제학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>경영경제학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="법학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>법학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="커뮤니케이션학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>커뮤니케이션학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="공간환경시스템공학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>공간환경시스템공학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="기계제어공학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>기계제어공학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="콘텐츠융합디자인학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>콘텐츠융합디자인학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="생명과학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>생명과학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="전산전자공학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>전산전자공학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="상담심리사회복지학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>상담심리사회복지학부</StyledliText>
              </Styledli>
              <Styledli>
                <StyledRadio
                  name="학부"
                  id="ICT창업학부"
                  onClick={onClick}
                  type="radio"
                />
                <StyledliText>ICT창업학부</StyledliText>
              </Styledli>
            </Styledul>
          )}
        </StyledFilterItem>
      </StyledSidebar>

      <div className=" w-full flex flex-col">
        <img
          className=" mb-[40px] w-[full] mx-[0px] bg-[#898989]"
          src="img/personBanner2.png"
        ></img>
        <div className="grid grid-cols-4 gap-10 mx-[20px] justify-between">
          {Users?.map((user) => (
            <Item>
              <div
                className={`flex border rounded-full bg-white w-[65px] h-[20px] justify-center items-center
              ${
                user?.position === "디자이너"
                  ? "border-[#d0a5fe] text-[#d0a5fe]"
                  : user?.position === "개발자"
                  ? "border-[#7b87e7] text-[#7b87e7]"
                  : "border-[#9797aa] text-[#9797aa]"
              }
              `}
              >
                <p className="text-[12px] font-bold">{user?.position}</p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="img/user.png"
                  className="rounded-full w-[60px] h-[60px]"
                />
                <p className="text-[16px] mt-[7px] font-semibold">
                  {user?.nickname}
                </p>
                <p className="text-[12px] mt-[3px] text-[#aaaaaa]">
                  {user?.department}
                </p>
                <p className="text-[12px] mt-[3px] text-[#aaaaaa]">
                  {user.grade}
                </p>
              </div>
            </Item>
          ))}
        </div>
        <div className="flex justify-center items-center w-full h-[100px] border ">
          <button
            id="prev"
            onClick={onPageClick}
            className="w-[70px] h-[30px] "
          >
            prev
          </button>
          {/* {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .map((e) => prevPage + e) */}

          {/* // ].map()
            //   .slice(
            //     Math.floor((nowPage - 1) / 10) * 10,
            //     Math.floor((nowPage - 1) / 10) * 10 + 10
            //   ) */}
          {Array.from({ length: TOTAL_PAGES }, (v, i) => i + 1)
            .slice(prevPage, nextPage - 1)
            .map((page) => (
              <button
                id={page + ""}
                onClick={onPageClick}
                className={`w-[30px] h-[30px] ${
                  page === nowPage && "bg-gray-400"
                } `}
              >
                {page}
              </button>
            ))}
          <button
            id="next"
            onClick={onPageClick}
            className="w-[70px] h-[30px] "
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Person;
