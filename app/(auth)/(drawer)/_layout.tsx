import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  createDrawerNavigator,
  DrawerToggleButton,
} from "@react-navigation/drawer";
import { Link, useNavigation, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  Button,
  StatusBar,
} from "react-native";
import Colors from "~/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { DrawerActions, NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { useDrawerStatus } from "@react-navigation/drawer";
import { Chat } from "~/utils/Interfaces";
import * as ContextMenu from "zeego/context-menu";
import { Keyboard } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useChat } from "~/utils/ChatContext";
import { useAuth, useUser } from "@clerk/clerk-expo";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import ChatPage from "~/components/ChatPage";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { BlurView } from "expo-blur";
import { User } from "~/utils/Interfaces";
import { LinearGradient } from "expo-linear-gradient";

// Add type for navigation prop
type NavigationProp = DrawerNavigationProp<Record<string, object>>;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedHeader = () => {
  const progress = useSharedValue(0);
  const pathLength = 2730; // Roughly calculated from the path coordinates
  const fullWidth = 200; // Matches SVG width for the underline

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1500,
      easing: Easing.ease,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: pathLength * (1 - progress.value),
    };
  });

  const underlineStyle = useAnimatedStyle(() => ({
    width: fullWidth * progress.value,
  }));

  return (
      <SafeAreaView>
        <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
        <View style={styles3.headerContainer}>
          <DrawerToggleButton/>
          <View style={styles3.container}>
            <Svg
              height="35"
              width="100"
              viewBox="0 0 470 200"
              preserveAspectRatio="xMidYMid meet"
            >
              <AnimatedPath
                d="M0 0 C6.67935634 3.57771139 9.77385167 10.02140017 12 17 C14.26725411 25.69516585 14.27823203 34.31876403 14.20581055 43.23413086 C14.18750552 45.5617978 14.18530198 47.88906519 14.18554688 50.21679688 C14.13770236 70.72459527 14.13770236 70.72459527 12 75 C17.94 75 23.88 75 30 75 C30.33 73.68 30.66 72.36 31 71 C33.86724686 71.57344937 34.8614515 71.8614515 37 74 C37.8353125 73.4740625 37.8353125 73.4740625 38.6875 72.9375 C41.70554844 71.71396685 42.97421345 71.78968538 46 73 C49.72217867 77.36026645 50.86654652 81.5216415 52 87 C59.19186166 86.84018085 64.43269688 83.36634405 70 79 C72.03136684 76.74146955 73.44432048 74.62856195 75 72 C76.65 72.33 78.3 72.66 80 73 C80.95518479 76.08388233 81.27838084 77.45308459 79.78515625 80.38671875 C78.93244141 81.52560547 78.93244141 81.52560547 78.0625 82.6875 C75.69464375 85.55653982 75.69464375 85.55653982 75 89 C80.90436923 84.1163329 86.03093773 78.8280757 91 73 C92.9375 73.6875 92.9375 73.6875 95 75 C96.21822425 78.09566075 96.16775422 79.54936612 95.00390625 82.67578125 C94.52824219 83.54589844 94.05257812 84.41601562 93.5625 85.3125 C92.85287109 86.63701172 92.85287109 86.63701172 92.12890625 87.98828125 C91.75636719 88.65214844 91.38382813 89.31601563 91 90 C92.69233251 89.45221064 94.37866109 88.88586641 96.0625 88.3125 C97.00222656 87.99925781 97.94195312 87.68601562 98.91015625 87.36328125 C105.3656433 84.51503222 108.81139765 82.16574445 111.66796875 75.484375 C112.52652087 73.24667185 113.36534267 71.00132949 114.1875 68.75 C115.12373625 66.32301423 116.06662694 63.89858664 117.015625 61.4765625 C117.25611069 60.85961517 117.49659637 60.24266785 117.74436951 59.60702515 C120.35309085 52.977597 123.34952209 46.54387865 126.4375 40.125 C126.93338623 39.08053711 127.42927246 38.03607422 127.94018555 36.95996094 C133.52545236 25.43683411 133.52545236 25.43683411 137.9375 22.875 C140 23 140 23 142.75 24.9375 C145.04234391 28.05763477 145.75318411 29.79750335 145.47265625 33.66015625 C142.7326427 47.22435557 133.42696859 60.50017767 126 72 C127.0828125 71.2575 127.0828125 71.2575 128.1875 70.5 C131.23858583 68.87275422 132.62077589 68.30682582 136 69 C138.375 71 138.375 71 140 74 C140.03140767 76.83192483 139.57029467 79.19605121 139 82 C144.17266065 81.95695428 148.34342042 81.32058872 153 79 C156.04811531 74.25229572 157.47697811 69.23942728 159.08691406 63.86279297 C160.81430358 58.44691878 163.00033319 53.20707898 165.125 47.9375 C165.73746582 46.36911377 165.73746582 46.36911377 166.36230469 44.76904297 C172.91306786 28.20678605 172.91306786 28.20678605 178 24 C180.5625 24.0625 180.5625 24.0625 183 25 C185.67428506 28.3110196 185.16938117 31.91367938 185 36 C182.23766829 48.74335348 175.49235881 59.8500424 169 71 C169.78890625 71.25265625 170.5778125 71.5053125 171.390625 71.765625 C174 73 174 73 175.109375 74.734375 C175.32078125 75.39953125 175.5321875 76.0646875 175.75 76.75 C175.97816406 77.45640625 176.20632813 78.1628125 176.44140625 78.890625 C177.15225159 81.57493608 177.65565206 84.2452165 178 87 C185.29141866 83.83378897 191.76585835 80.10253333 197 74 C198.19880755 70.71060456 198.19880755 70.71060456 198 68 C198.86625 67.855625 199.7325 67.71125 200.625 67.5625 C202.85823332 67.19029445 205.08771668 66.79477044 207.3125 66.375 C208.199375 66.25125 209.08625 66.1275 210 66 C210.33 66.33 210.66 66.66 211 67 C210.67 69.31 210.34 71.62 210 74 C215.61 74 221.22 74 227 74 C227.33 72.68 227.66 71.36 228 70 C231.3125 70.1875 231.3125 70.1875 235 71 C236.92171842 73.41764576 238 74.88467214 238 78 C243.29481709 78.09289153 247.64210878 77.76541303 253 77 C254.98 72.05 256.96 67.1 259 62 C256.916875 62.20625 254.83375 62.4125 252.6875 62.625 C246.375 63.25 246.375 63.25 243 61 C243 59.68 243 58.36 243 57 C244.86591797 57.05800781 244.86591797 57.05800781 246.76953125 57.1171875 C252.15737437 56.97312173 257.20485485 56.64066049 262 54 C266.77472691 48.48464713 269.0484469 41.45284628 271.69726562 34.75683594 C273.79476125 30.31813267 276.79359972 26.68724556 280 23 C284.875 23.875 284.875 23.875 286 25 C286.82815146 33.28151459 284.25040767 39.4640846 281 47 C280.67 47.78761719 280.34 48.57523438 280 49.38671875 C279.34847605 50.93095581 278.67739978 52.46693735 278 54 C279.08925781 53.84144531 280.17851562 53.68289062 281.30078125 53.51953125 C286.59342517 52.86334131 291.85905675 52.74117807 297.1875 52.6875 C298.15880859 52.65849609 299.13011719 52.62949219 300.13085938 52.59960938 C307.27033661 52.53599512 307.27033661 52.53599512 311.17578125 55.01953125 C311.77777344 55.67308594 312.37976563 56.32664063 313 57 C312.67 58.32 312.34 59.64 312 61 C311.34 61 310.68 61 310 61 C310 60.34 310 59.68 310 59 C306.04 59 302.08 59 298 59 C297.67 60.65 297.34 62.3 297 64 C295.4375 66.3125 295.4375 66.3125 294 68 C290.125 67.125 290.125 67.125 289 66 C289.28730055 63.66055264 289.61936779 61.3260857 290 59 C284.47579495 58.58638566 279.04741153 58.44376028 274 61 C269.24874343 65.77109481 266.26315792 71.93224947 263.19238281 77.85913086 C262 80 262 80 259.75 82.7734375 C257.74266336 85.32741493 257.25918874 87.13007038 256.75 90.3125 C256.60046875 91.19550781 256.4509375 92.07851562 256.296875 92.98828125 C256.14992188 93.98408203 256.14992188 93.98408203 256 95 C268.62793184 91.34698594 278.67448903 81.22268076 285 70 C288.875 70.875 288.875 70.875 290 72 C290.83562339 77.431552 288.71883931 81.00998622 286.19140625 85.6328125 C285.10947266 87.78249039 284.47070259 89.65189744 284 92 C290.77919227 88.99984683 296.26959937 85.43843779 301.87109375 80.57421875 C304 79 304 79 307 79 C307.80859375 82.20703125 307.80859375 82.20703125 308 86 C302.79222817 92.45201789 294.02894078 98.11253986 285.8125 99.5625 C281.95388858 98.79077772 280.43541573 97.00845473 278 94 C278 93.34 278 92.68 278 92 C277.195625 92.53625 276.39125 93.0725 275.5625 93.625 C275.0159375 93.98464844 274.469375 94.34429687 273.90625 94.71484375 C272.53442697 95.63969985 271.18230034 96.59401733 269.84375 97.56640625 C261.73207398 103.33069658 261.73207398 103.33069658 256 103 C252.92894347 100.99713704 251.37376178 99.43794461 250.4375 95.8359375 C249.85045927 91.44780801 250.10976419 88.45117903 251 84 C245.06 84.495 245.06 84.495 239 85 C238.608125 86.216875 238.21625 87.43375 237.8125 88.6875 C236.25569479 92.75691641 234.64399636 95.43263893 231 98 C227.4375 98.1875 227.4375 98.1875 224 97 C220.91569801 93.75752867 219.76862189 91.20930644 219.6875 86.8125 C220 83 220 83 221 80 C217.7 80 214.4 80 211 80 C210.938125 81.98 210.938125 81.98 210.875 84 C210.25478356 89.52953532 207.98939426 93.17760364 204 97 C200.9375 98.6875 200.9375 98.6875 198 99 C194.52948391 97.65911878 193.3247775 96.66502059 191.6875 93.3125 C191.460625 92.549375 191.23375 91.78625 191 91 C190.154375 91.495 189.30875 91.99 188.4375 92.5 C184.53749925 94.20181851 182.20610724 94.623127 178 94 C173.87711445 90.21140246 172.11643109 85.67791505 171.875 80.125 C171.91625 79.42375 171.9575 78.7225 172 78 C163.13631404 81.24281194 158.59826147 90.22321678 154 98 C150.125 97.125 150.125 97.125 149 96 C149.08937803 94.47480724 149.24537146 92.95318071 149.4375 91.4375 C149.53933594 90.61121094 149.64117187 89.78492187 149.74609375 88.93359375 C149.87177734 87.97646484 149.87177734 87.97646484 150 87 C141.26912529 88.85200373 134.77307836 90.55329337 127.9296875 96.5703125 C126 98 126 98 122.125 98.625 C118.92298104 97.98459621 117.82825928 97.64081896 116 95 C115.67 94.34 115.34 93.68 115 93 C113.68 94.98 112.36 96.96 111 99 C109.68 98.67 108.36 98.34 107 98 C106.67 96.35 106.34 94.7 106 93 C105.12988281 93.45052734 105.12988281 93.45052734 104.2421875 93.91015625 C100.64192091 95.66276127 97.85520985 96.98323118 93.8125 97.0625 C90.0979235 95.65921554 87.90531654 93.69779393 85 91 C84.13375 91.825 83.2675 92.65 82.375 93.5 C80.05830348 95.40338916 79.02885052 95.99398948 76 96.625 C71.85020558 95.76045949 70.05096606 93.90568196 67 91 C65.453125 91.99 65.453125 91.99 63.875 93 C60.42745799 94.96405424 58.01543567 95.53539142 54 95 C50.14712288 93.61807136 48.99620553 91.75753867 47.25 88.125 C46.82203125 87.26132813 46.3940625 86.39765625 45.953125 85.5078125 C45 83 45 83 45 79 C40.34160843 81.79637935 37.52437554 84.51570606 34.3125 89 C33.56613281 90.03125 32.81976563 91.0625 32.05078125 92.125 C31.37402344 93.07375 30.69726562 94.0225 30 95 C29.00422551 96.33649203 28.00612198 97.67128018 27 99 C25.68 98.67 24.36 98.34 23 98 C21.29336978 92.0428945 23.57726113 88.5062247 26 83 C21.05 83 16.1 83 11 83 C10.896875 84.63710937 10.79375 86.27421875 10.6875 87.9609375 C10.08075282 95.23122149 8.79685314 102.31277988 7.41601562 109.46728516 C6.99416185 111.65528027 6.58237626 113.84500556 6.171875 116.03515625 C4.14808914 126.70382172 4.14808914 126.70382172 3 129 C-0.16115776 127.63016497 -0.9927092 127.0109362 -3 124 C-3.44494027 121.94753357 -3.83258613 119.88243392 -4.1875 117.8125 C-5.35504472 112.14492111 -6.96598175 107.00253886 -9.25 101.6875 C-9.51321045 101.05497314 -9.7764209 100.42244629 -10.04760742 99.77075195 C-12.4974811 94.29560709 -15.49297752 89.01760325 -20 85 C-23.79972825 83.70135841 -27.38503055 83.71142697 -31.375 83.76953125 C-32.99994385 83.75305794 -32.99994385 83.75305794 -34.65771484 83.73625183 C-36.9404363 83.72577922 -39.22336223 83.73805814 -41.50585938 83.77172852 C-44.99242672 83.81241163 -48.46722729 83.75176209 -51.953125 83.68164062 C-54.17709819 83.68399364 -56.40107462 83.69225925 -58.625 83.70703125 C-60.17840088 83.6719622 -60.17840088 83.6719622 -61.76318359 83.63618469 C-66.21876256 83.7650975 -68.92054692 83.92285795 -72.15953064 87.15490723 C-73.96126381 89.70147547 -75.50317794 92.26518585 -77 95 C-77.95110737 96.50282706 -78.90929674 98.00123083 -79.87890625 99.4921875 C-80.7783307 100.95011761 -81.67283644 102.41109315 -82.5625 103.875 C-83.03284668 104.64803467 -83.50319336 105.42106934 -83.98779297 106.2175293 C-91.03444763 117.48383106 -91.03444763 117.48383106 -95 130 C-97.375 130.1875 -97.375 130.1875 -100 130 C-102.4912301 126.26315484 -102.16197729 124.71332484 -101.56591797 120.43017578 C-100.61593626 116.35074615 -98.69332913 113.01181984 -96.5625 109.4375 C-95.90338623 108.2920874 -95.90338623 108.2920874 -95.23095703 107.12353516 C-90.68666294 99.29483114 -85.88075899 91.6222917 -81 84 C-82.17691406 84.02320312 -83.35382813 84.04640625 -84.56640625 84.0703125 C-132.71734275 84.72340782 -132.71734275 84.72340782 -144.9375 74.375 C-148.1430363 71.1483283 -149.2182391 68.92543848 -149.5 64.375 C-149.40957777 59.14558105 -147.98162815 56.46431187 -144.296875 52.81640625 C-128.47679815 40.30563119 -107.15869296 40.7057264 -88 42 C-78.32786279 43.13818584 -68.95793703 45.60520495 -59.93359375 49.265625 C-58.03311037 50.11835091 -58.03311037 50.11835091 -56 50 C-54.11182463 47.63902309 -52.3268716 45.26370933 -50.5625 42.8125 C-45.01213384 35.25154631 -39.14393053 28.08163693 -33 21 C-32.36449219 20.24074219 -31.72898437 19.48148438 -31.07421875 18.69921875 C-23.79145209 10.0770927 -12.52429749 -2.5993825 0 0 Z M-32 32 C-37.97639748 39.43506708 -43.79675292 47.00079124 -49 55 C-48.39414063 55.3403125 -47.78828125 55.680625 -47.1640625 56.03125 C-32.34604598 64.60290263 -32.34604598 64.60290263 -27.63208008 70.79760742 C-24.97183841 74.08329907 -23.15726772 75.78961262 -18.90991211 76.56176758 C-15.27037423 76.68845955 -11.69989372 76.61107254 -8.0625 76.4375 C-6.17821289 76.39012695 -6.17821289 76.39012695 -4.25585938 76.34179688 C-1.16815119 76.25961453 1.91469797 76.1447677 5 76 C10.93216756 41.05884841 10.93216756 41.05884841 2 8 C0.98006704 6.78116612 0.98006704 6.78116612 -1.125 6.6875 C-13.55195067 8.03825551 -24.48045447 23.01818612 -32 32 Z M137 35 C138 37 138 37 138 37 Z M136 37 C137 39 137 39 137 39 Z M135 39 C136 41 136 41 136 41 Z M176 39 C177 41 177 41 177 41 Z M134 41 C133.13624104 42.61992165 132.28424146 44.24611861 131.4375 45.875 C130.96183594 46.77992187 130.48617188 47.68484375 129.99609375 48.6171875 C129.66738281 49.40351562 129.33867187 50.18984375 129 51 C129.33 51.66 129.66 52.32 130 53 C130.86646667 51.56988027 131.71781829 50.13059381 132.5625 48.6875 C133.03816406 47.88699219 133.51382812 47.08648437 134.00390625 46.26171875 C135.342681 43.90841521 135.342681 43.90841521 134 41 Z M175 41 C176 43 176 43 176 43 Z M174 44 C175 46 175 46 175 46 Z M274 44 C275 46 275 46 275 46 Z M173 46 C174 48 174 48 174 48 Z M273 46 C274 48 274 48 274 48 Z M172 48 C173 50 173 50 173 50 Z M-140.609375 60.9609375 C-142.57318476 63.84045631 -142.68975627 66.57915463 -143 70 C-132.45202186 73.29224772 -122.25139046 75.04374082 -111.24023438 75.76367188 C-108.12638487 75.99078206 -105.0235193 76.28780812 -101.91665649 76.59440613 C-98.97544068 76.86728781 -96.0315923 77.07618973 -93.08441162 77.27310181 C-91.62631181 77.38159629 -90.16971161 77.51297333 -88.71588135 77.66854858 C-80.66117935 78.65089548 -80.66117935 78.65089548 -73.39227295 75.77462769 C-69.95762334 72.25192271 -67.47892055 68.22642814 -65 64 C-63.95834421 62.39582627 -62.91667978 60.79165815 -61.875 59.1875 C-61.25625 58.135625 -60.6375 57.08375 -60 56 C-84.72962584 48.01519918 -119.02103169 42.54735056 -140.609375 60.9609375 Z M171 51 C172 53 172 53 172 53 Z M128 53 C129 55 129 55 129 55 Z M127 55 C128 57 128 57 128 57 Z M-53 60 C-54.62923935 62.08013585 -56.2534547 64.16387974 -57.875 66.25 C-58.33519531 66.83652344 -58.79539062 67.42304687 -59.26953125 68.02734375 C-59.71425781 68.60097656 -60.15898438 69.17460938 -60.6171875 69.765625 C-61.22989502 70.55114746 -61.22989502 70.55114746 -61.85498047 71.35253906 C-63.27584588 73.31296776 -63.27584588 73.31296776 -65 77 C-52.79 76.67 -40.58 76.34 -28 76 C-32.12851785 71.87148215 -35.73034341 68.90458476 -40.5 65.75 C-41.15097656 65.30398437 -41.80195312 64.85796875 -42.47265625 64.3984375 C-45.94822636 62.08139076 -48.74246007 60.42575399 -53 60 Z M132 76 C130.22750476 77.4354503 128.45706424 78.87343803 126.6875 80.3125 C125.70136719 81.11300781 124.71523438 81.91351563 123.69921875 82.73828125 C121.68397834 84.42688356 119.80511991 86.09630699 118 88 C118.33 88.66 118.66 89.32 119 90 C127.6555728 86.33567095 127.6555728 86.33567095 133 79 C132.67 78.01 132.34 77.02 132 76 Z M203 78 C199.14876979 82.31075199 196.29765127 86.04697456 196 92 C199.34072178 90.61220551 200.90199421 89.18411804 202.8125 86.125 C203.47185547 85.10792969 203.47185547 85.10792969 204.14453125 84.0703125 C205.16843185 81.59237953 204.90457722 80.47510086 204 78 C203.67 78 203.34 78 203 78 Z M230 80 C226.7089159 83.60957611 225.45336079 86.12637153 225 91 C226.939509 90.80811844 226.939509 90.80811844 229 90 C230.34231442 88.16016576 230.34231442 88.16016576 231.25 85.9375 C231.58515625 85.20402344 231.9203125 84.47054687 232.265625 83.71484375 C232.50796875 83.14894531 232.7503125 82.58304687 233 82 C232.01 81.34 231.02 80.68 230 80 Z M-14 85 C-13.39671875 85.90621094 -12.7934375 86.81242187 -12.171875 87.74609375 C-7.8438922 94.31798168 -3.91372918 100.65233511 -1 108 C1.38114959 104.10733806 1.88859091 99.92596894 2.625 95.5 C2.7590625 94.74074219 2.893125 93.98148438 3.03125 93.19921875 C3.63320179 89.69192824 4 86.58741579 4 83 C1.37472811 82.94617894 -1.24944713 82.90641687 -3.875 82.875 C-4.99455078 82.84986328 -4.99455078 82.84986328 -6.13671875 82.82421875 C-10.53652444 82.59911196 -10.53652444 82.59911196 -14 85 Z "
                fill="#ffffff"
                transform="translate(149,0)"
                stroke="black"
                strokeWidth={0.5}
                strokeDasharray={pathLength}
                animatedProps={animatedProps}
              />
            </Svg>

            {/* Animated underline */}
            <Animated.View style={[styles3.underline, underlineStyle]} />
          </View>
        </View>
      </SafeAreaView>
  );
};

//<BlurView intensity={70} tint="systemUltraThinMaterialLight">

const styles3 = StyleSheet.create({
  headerContainer: {
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 40, // Space between the toggle button and animation
  },
  underline: {
    height: 1,
    backgroundColor: "white",
  },
});

// ------------------------------------------

export const CustomDrawerContent = ({
  chatId,
  ...props
}: { chatId?: string | null } & any) => {
  const { signOut } = useAuth();
  const { bottom, top } = useSafeAreaInsets();
  // const db = useSQLiteContext();
  const isDrawerOpen = useDrawerStatus() === "open";
  const [history, setHistory] = useState<Chat[]>([]);
  const [Message, setMessage] = useState("");
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const getChats = useQuery(api.chats.getChats);
  // const createChat = useMutation(api.chats.getOrCreateChat);

  // GET ALL PRIVATE CHATS AND MAP TO HISTORY
  const loadChats = async () => {
    try {
      if (!currentUser) return;

      // Create or get the AI chat, only 1 AI chat per user
      // const chatId = await createChat({
      //   senderId: currentUser.userId!,
      //   participantIds: [],
      //   isAi: true,
      //   type: "group",
      // });

      // setchatId(chatId);
      // Fetch all chats
      const allChats = await getChats;

      if (!allChats) {
        return;
      }

      // Update history with all chats
      setHistory(
        allChats.map((chat: any) => ({
          id: chat._id,
          title: chat.isAi ? "AI" : "Private",
          type: chat.type,
        }))
      );
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  useEffect(() => {
    loadChats();
  }, [getChats]); // Runs on mount

  // Add useEffect to load chats when drawer opens
  // useEffect(() => {
  //   if (isDrawerOpen) {
  //     loadChats();
  //     Keyboard.dismiss();
  //   }
  // }, [isDrawerOpen]);

  const handleChatPress = (chat: Chat) => {
    if (!chat.id) {
      console.error("Chat ID is not defined");
      return;
    }

    if (chat.type == "group") {
      console.log("LISTING THE CHATS ARRAY");
      console.log(chat);
      console.log("LISTING THE CHATS ARRAY");
      console.log(`/(auth)/(drawer)/(ai-chat)/${encodeURIComponent(chat.id)}`);

      router.push(`/(auth)/(drawer)/(ai-chat)/${encodeURIComponent(chat.id)}`);
    } else {
      router.push(
        `/(auth)/(drawer)/(private-chat)/${encodeURIComponent(chat.id)}`
      );
    }
  };

  // ... existing code ...

  const onDeleteChat = (chatId: string) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          // Delete the chat
          // await db.runAsync('DELETE FROM chats WHERE id = ?', chatId);
          loadChats();
        },
      },
    ]);
  };

  const onRenameChat = (chatId: string) => {
    Alert.prompt(
      "Rename Chat",
      "Enter a new name for the chat",
      async (newName) => {
        if (newName) {
          // Rename the chat
          // await renameChat(db, chatId, newName);
          loadChats();
        }
      }
    );
  };

  return (
    <View style={{ flex: 1, marginTop: top }}>
      <View style={{ backgroundColor: "#fff", paddingBottom: 10 }}>
        <View style={styles.searchSection}>
          <Ionicons
            style={styles.searchIcon}
            name="search"
            size={20}
            color={Colors.greyLight}
          />
          <TextInput
            style={styles.input}
            placeholder="Search"
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      <Button
        title="Sign Out"
        onPress={() => signOut()}
        color={Colors.greyLight}
      />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: "#fff", paddingTop: 0 }}
      >
        <DrawerItemList {...props} />
        {history.map((chat) => {
          const chatType = chat.type === "group" ? "ai-chat" : "private-chat";
          return (
            <ContextMenu.Root key={chat.id}>
              <ContextMenu.Trigger>
                <DrawerItem
                  label={chat.title || "untitled chat"}
                  onPress={() => handleChatPress(chat)}
                  inactiveTintColor="#000"
                />
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Preview>
                  {() => (
                    <View
                      style={{
                        padding: 16,
                        height: 200,
                        backgroundColor: "#fff",
                      }}
                    >
                      <Text>{chat.title || "Untitled Chat"}</Text>
                    </View>
                  )}
                </ContextMenu.Preview>

                <ContextMenu.Item
                  key={"rename"}
                  onSelect={() => onRenameChat(chat.id)}
                >
                  <ContextMenu.ItemTitle>Rename</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{
                      name: "pencil",
                      pointSize: 18,
                    }}
                  />
                </ContextMenu.Item>
                <ContextMenu.Item
                  key={"delete"}
                  onSelect={() => onDeleteChat(chat.id)}
                  destructive
                >
                  <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{
                      name: "trash",
                      pointSize: 18,
                    }}
                  />
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
          );
        })}
      </DrawerContentScrollView>

      <View
        style={{
          padding: 16,
          paddingBottom: 10 + bottom,
          backgroundColor: Colors.light,
        }}
      >
        <Link href="/(auth)/(modal)/settings" asChild>
          <TouchableOpacity style={styles.footer}>
            <Image
              source={require("~/assets/images/sample.png")}
              style={styles.avatar}
            />
            <Text style={styles.userName}>sample user</Text>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={Colors.greyLight}
            />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const Layout = () => {
  const currentUser = useQuery(api.users.getCurrentUser) as User | undefined;
  // Initialize with current user's chat ID if available
  const [chatId, setChatId] = useState<string | null>(currentUser?.defaultChatId ?? null);
  const dimensions = useWindowDimensions();
  const router = useRouter();
  const Drawer = createDrawerNavigator();
  const INitAiChat = useMutation(api.chats.initAiChat);
  const updateuserchatid = useMutation(api.users.updateChatID);
  const isInitializing = useRef(false);
  // const [userId, setUserId] = useState<string | null>(null);
  // const userIdInitialized = useRef(false);
  // const { user } = useUser();

  
  // useEffect(() => {
  //   if (user?.id && !userIdInitialized.current) {
  //     setUserId(user.id);
  //     userIdInitialized.current = true;
  //   }
  // }, [user]);

  useEffect(() => {
    const initializeChat = async () => {
      if (currentUser === undefined) return; // Still loading
      if (isInitializing.current) return;
      
      // Immediate update if we have a valid chat ID
      if (currentUser?.defaultChatId && currentUser.defaultChatId !== chatId) {
        setChatId(currentUser.defaultChatId);
        return;
      }

      // Only proceed if we truly need to create a new chat
      if (!currentUser?.defaultChatId) {
        isInitializing.current = true;
        try {
          const id = await INitAiChat();
          if (id) {
            await updateuserchatid({ defaultChatId: id });
            setChatId(id); // Ensure state is updated before navigation
            router.replace(`/(auth)/(drawer)/(ai-chat)/${id}`);
          }
        } catch (error) {
          console.error("Chat initialization failed:", error);
        } finally {
          isInitializing.current = false;
        }
      }
    };

    initializeChat();
  }, [currentUser]);

  if (currentUser === undefined || chatId === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  console.log("this is CHATID global from DRAWER LAYOUT-->>>>");
  console.log(chatId);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} chatId={chatId} />
      )}
      screenOptions={{
        headerLeft: () => <DrawerToggleButton />,
        headerStyle: {
          backgroundColor: "#f2f2f2",
        },
        headerShadowVisible: false,
        drawerActiveBackgroundColor: Colors.selected,
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#fff",
        overlayColor: "rgba(213, 22, 22, 0.2)",
        drawerItemStyle: { borderRadius: 12 },
        drawerLabelStyle: { marginLeft: -20 },
        drawerStyle: { width: dimensions.width * 0.86 },
      }}
    >
      <Drawer.Screen
        name="(ai-chat)/[id]"
        initialParams={{ id: chatId }}
        options={{
          header: () => <AnimatedHeader />,
        }}
        component={ChatPage}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    marginHorizontal: 16,
    borderRadius: 10,
    height: 34,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.input,
  },
  searchIcon: {
    padding: 6,
  },
  input: {
    flex: 1,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 0,
    alignItems: "center",
    color: "#424242",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roundImage: {
    width: 30,
    height: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  item: {
    borderRadius: 15,
    overflow: "hidden",
  },
  btnImage: {
    margin: 6,
    width: 16,
    height: 16,
  },
  dallEImage: {
    width: 28,
    height: 28,
    resizeMode: "cover",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Layout;
