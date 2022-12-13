sap.ui.define([
], function () {
    "use strict";

    // 20221122 화요일
    // 조건문 (if, if-else, for, while)

    // var walk = prompt("오늘 걸은 걸음 수는?"); 
    // if(walk >= 100){
    //     document.write("good!");
    // } else {
    //     document.write("bad!");
    // }

    // var n = prompt("숫자를 입력하세요");
    // if(n % 3 == 0){
    //     document.write(n + "은 3의 배수입니다.")
    // } else {
    //     document.write(n + "은 3의 배수가 아닙니다.")
    // }

    // var month = prompt("현재는 몇 월인가요?", 0);
    // if (month >= 9 && month <= 11) {
    //     document.write("독서의 계절 가을이네요!");
    // } else if (month >= 6 && month <= 8) {
    //     document.write("여행 가기 좋은 여름이네요!!");
    // } else if (month >= 3 && month <= 5) {
    //     document.write("햇살 가득한 봄이네요!!");
    // } else {
    //     document.write("스키의 계절 겨울이네요!!");
    // }


    // var n = prompt("숫자를 입력하세요");
    // if (n % 6 == 0) {
    //     document.write(n + "은 6의 배수입니다.")
    // } else if (n % 2 == 0) {
    //     document.write(n + "은 2의 배수입니다.")
    // } else if (n % 3 == 0) {
    //     document.write(n + "은 3의 배수입니다.")
    // } else {
    //     document.write(n + "은 어떠한 배수도 아닙니다.")
    // }

    // var hour = prompt("시간을 입력해주세요");
    // var min = Number(prompt("분을 입력해주세요"));
    // if(min < 45){
    //     hour--;

    //     if(hour < 0)
    //         hour += 24;

    //     min += 15;
    // } else{ //min >= 45
    //     min -= 45;
    // }
    // document.write(hour + "시 " + min + "분");


    // var site = prompt("네이버, 다음, 네이트, 구글 중 즐겨 사용하는 포털 검색 사이트는?", "");
    // var url;
    // switch(site){
    //     case "네이버" : url = "www.naver.com";
    //         break;
    //     case "다음" : url = "www.daum.net";
    //         break;
    //     case "네이트" : url = "www.nate.com";
    //         break;
    //     case "구글" : url = "www.google.com";
    //         break;
    //     default:
    //         alert("보기 중에 없는 사이트 입니다.");
    // }

    // if(url)
    //     location.href = "https://" + url;


    // var month = Number(prompt("월을 입력해주세요"));
    // var result;
    // switch(month){
    //     case 1:
    //     case 3:
    //     case 5:
    //     case 7:
    //     case 8:
    //     case 10:
    //     case 12:
    //         result = "31일 까지 있습니다.";
    //         break;
    //     case 4:
    //     case 6:
    //     case 9:
    //     case 11:
    //         result = "30일 까지 있습니다."
    //         break;
    //     case 2:
    //         result = "28일 까지 있습니다."
    //         break;
    //     default:
    //         alert("ERR");
    // }   
    // if(result)
    //     document.write(result);


    // var a = 1;
    // while(a <= 10){
    //     document.write(a++ + "<br/>");
    // }

    // var i = 10;
    // do {
    //     document.write("hello" + i + "<br />");
    //     i--;
    // } while (i > 3)

    // for (var i = 1; i <= 10; i++) {
    //     document.write("반복" + i + "<br />");
    // }

    // var num1 = prompt("For문:: 몇 단을 출력하시겠습니까?");
    // var num2 = prompt("While문:: 몇 단을 출력하시겠습니까?");
    // var num3 = prompt("Do-While문:: 몇 단을 출력하시겠습니까?");
    // document.write("==================For문==================<br/>")
    // for (var i = 1; i <= 9; i++) {
    //     document.write(num1 + " * " + i + " = " + num1 * i + "<br />");
    // }

    // document.write("==================While문==================<br/>")
    // var a = 1;
    // while (a <= 9) {
    //     document.write(num2 + " * " + a + " = " + num2 * a++ + "<br />");
    // }

    // document.write("==================Do-While문==================<br/>")
    // var b = 1;
    // do {
    //     document.write(num3 + " * " + b + " = " + num3 * b++ + "<br />");
    // } while (b < 10)


    // for (var i = 1; i <= 10; i++) {
    //     if (i % 6 == 0) {
    //         break;
    //     }
    //     document.write("숫자 < 6 : " + i + "<br />");
    // }

    // for (var i = 1; i <= 10; i++) {
    //     if (i % 2 == 0) {
    //         continue;
    //     }
    //     document.write("홀수 : " + i + "<br />");
    // }

    // var num = Number(prompt("숫자를 입력하세요 : "));
    // var temp = num;
    // var cnt = 0;
    // while(true){
    //     cnt++;

    //     var t = parseInt(temp / 10);
    //     var z = temp % 10;

    //     temp = ((t+z) % 10) + (z * 10);

    //     if(num == temp)
    //         break;  
    // }

    // document.write("cycle " + cnt);
});
