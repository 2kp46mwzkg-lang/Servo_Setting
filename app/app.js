/* Réglages Servo — fonctionnement de la page : base (navigateur ou page Claude), projets, import du dossier élec,
   calculs des axes, onglets, génération du script Machine Expert, catalogues.
   Chargé en dernier par index.html ; les autres fichiers (catalogue/, machine-expert/, app/dictionnaire_es.js) sont chargés avant. */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = v => { if (v === '' || v == null) return null; if (typeof v === 'number') return isFinite(v) ? v : null; const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? n : null; };
const fmt = (v, d = 2) => (v == null || !isFinite(v)) ? '—' : v.toLocaleString('fr-FR', { maximumFractionDigits: d });
const nice = v => { if (!isFinite(v) || v <= 0) return v; const p = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.floor(v / p) * p; };

// Gains de base proposés par Schneider (variateur neuf) et règle de proposition calée sur P1 (rapport 8,1 -> 5,5 / 2,1 stable)
const GAIN_BASE = { p: 25, i: 5, expP: 0.7, expI: 0.4 };
const COLL = { motors: 'moteurs', reducers: 'reducteurs', drives: 'variateurs', axes: 'axes', projects: 'projets', hwtypes: 'materiels', iodict: 'esdico' };
const SEW_CAT={"KH19":["1643/28/70","3233/60/70","795/16/70","2491/56/69","1219/30/67","583/17/64","1333/42/80","1113/38/61","2623/90/80","2173/80/60","215/8/80","2021/84/80","989/45/80","946/51/80","301/19/80","1763/120/80","559/44/80","817/69/79","258/25/76","115/12/63","275/34/80","525/76/80","205/32/80","975/176/80","475/92/80","9/2/80"],"KH29":["1007/14/130","265/4/130","1961/32/130","1537/28/130","1007/20/130","2915/68/128","817/21/130","2809/76/122","215/6/130","1591/48/130","1325/44/115","1247/42/130","817/30/130","2491/100/109","2365/102/130","265/12/105","2279/114/130","1075/66/130","2021/150/130","215/18/130","2860/289/110","688/75/130","2756/323/122","172/23/123","1300/187/112","2444/425/112","260/51/110","1664/425/126","1248/391/110"],"KH39":["1456/25/300","4224/85/300","4128/95/300","1032/25/300","1992/55/300","768/25/300","416/15/300","122/5/300","576/25/300","2256/115/295","624/35/290","1776/115/280","336/25/270","1935/152/250","387/32/255","3735/352/285","9/1/300","65/8/300","915/128/300","27/4/300","2115/368/275","585/112/260","1665/368/240","63/16/215","45/16/170"],"KH49":["376/5/475","5264/75/445","5123/85/500","5029/95/500","5029/100/500","2444/55/500","4747/125/500","940/27/500","611/20/500","3619/125/500","2914/115/500","799/35/500","2303/115/500","2209/125/500","47/3/490","1739/130/470","909/80/495","125/12/480","585/64/500","693/80/500","1395/184/500","765/112/500","2205/368/500","423/80/485","75/16/465","1665/416/440"],"K37":["71489/672","11737/120","4268/51","33077/456","65087/960","2813/48","7469/150","1067/24","43747/1152","1067/30","33077/1104","9312/323","9021/361","17751/760","8439/418","8148/475","291/19","3977/304","11529/950","10962/1045","21168/2375","756/95","2583/380","3024/475","11718/2185","378/95"],"K47":["33759/256","19437/160","113553/1088","27621/304","217899/2560","19251/256","205623/2944","101277/1600","341/6","50127/1024","9207/200","58311/1472","31713/896","22599/722","178281/6080","173259/6688","168237/6992","82863/3800","372/19","41013/2432","7533/475","2511/184","25947/2128","5589/475","2208/209","30429/3344","44712/5225","81/11","19251/2926","1215/209","24219/5225"],"K57":["29029/200","10527/85","41151/380","41151/400","7221/80","1914/25","4147/60","19459/320","2871/50","44979/920","12441/280","35409/920","74617/2090","14384/475","23374/855","54839/2280","10788/475","42253/2185","11687/665","33263/2185","6293/475","43493/3648","2139/190","1457/152","9269/1064","1147/152","4991/760","713/152"],"K67":["11583/80","29403/238","114939/1064","114939/1120","20169/224","2673/35","3861/56","54351/896","8019/140","125631/2576","34749/784","98901/2576","208413/5852","3627/133","51057/2128","15066/665","118017/6118","32643/1862","92907/6118","2511/190","4743/380","74307/6992","20553/2128","58497/6992","11067/1520","1581/304"],"K77":["3267/17","15246/85","356103/2312","349569/2584","349569/2720","3861/34","329967/3400","3025/34","42471/544","251559/3400","101277/1564","3267/56","160083/3128","153549/3400","5445/136","309969/8075","34100/969","39897/1292","236313/8075","190278/7429","3069/133","150381/7429","144243/8075","5115/323","113553/8398","1643/133","80507/7429","77221/8075","8215/969","60791/8398"],"K87":["134211/680","26477/152","8217/50","5893/40","126907/1000","125081/1080","8217/80","79431/920","66649/840","64823/920","62997/1000","61171/1080","6391/130","24651/560","913/25","187829/5985","182683/6555","59179/2375","172391/7695","72044/3705","23157/1330","118854/7429","20584/1425","82336/6555","46872/4199","22599/2261","13392/1615","53568/7429"],"K97":["45069/256","490281/3200","53867/384","126907/1024","309507/2944","86735/896","254727/2944","249249/3200","81257/1152","52041/832","101343/1792","19173/400","123255/2944","239289/6992","228997/8208","2573/104","95201/4256","18011/950","115785/6992","23157/1672","43741/3648","104625/10051","41850/4807","13175/1748"],"K107":["36729/256","89397/736","3597/32","74151/736","14553/160","7931/96","7623/104","4257/64","22869/400","36729/736","2709/64","9471/256","1001/32","7161/247","3999/152","21483/950","34503/1748","27993/1672","8897/608","108438/8075","87079/7429","70649/7106","67363/7752","21359/2907"],"K127":["9933/68","64801/476","191565/1564","46827/425","19866/221","78045/952","1419/20","4257/68","7353/136","26015/544","6149/153","73315/2023","2666/85","7998/289","75981/3179","73315/3468","138632/7803","37324/2601","22165/1734","83824/7803","22568/2601"],"K157":["7370/49","68541/560","72963/728","143715/1568","223311/2800","90651/1288","3417/56","24321/448","2948/63","9581/252","115039/3675","93398/3381","38726/1617","12529/588","72896/3969","59228/3969","1139/90"],"K167":["217634/1323","212602/1575","6919/63","27676/315","12580/161","15725/231","45917/756","12580/243","72964/1701","6919/189","47175/1463","45917/1596","12580/513","72964/3591","6919/399"],"K187":["6475/36","3965/24","13013/90","26845/207","22295/198","44135/432","21385/243","35945/486","1729/27","8645/162","91/2","16835/396","233285/6048","113035/3402","189995/6804","9139/378","45695/2268","481/28"],"R07":["66270/847","8648/121","11280/187","118440/2299","5781/121","57810/1309","54990/1331","7544/187","107160/2783","9840/289","103320/3553","5043/187","47970/2057","93480/4301","1410/77","184/11","240/17","2520/209","123/11","1170/121","2280/253","432/55","329/44","1127/165","98/17","1029/209","2009/440","1911/484","931/253","882/275"],"R17":["9715/119","102979/1463","25259/385","48575/847","13601/253","91321/1925","46163/1045","88775/2299","173999/4807","166897/5225","17755/627","60367/2508","1943/77","1273/55","335/17","3551/209","871/55","1675/121","3283/253","3149/275","335/33","1139/132","2438/323","598/85","1150/187","98/17","2162/425","230/51","23/6"],"R27":["26477/196","17347/140","50215/476","48389/532","11869/140","2075/28","6391/92","42911/700","305855/5474","294733/6118","72293/1610","139025/3542","38927/1058","261367/8050","27805/966","94537/3864","5561/196","913/35","2656/119","2573/133","5063/280","2407/154","332/25","83/7","3403/336","160/17","155/19","61/8","145/22","28/5","5/1","205/48","4/1","155/46"],"R37":["22649/168","14839/120","42955/408","41393/456","10153/120","1775/24","38269/552","36707/600","261635/4692","252121/5244","61841/1380","118925/3036","233093/6348","223579/6900","23785/828","80869/3312","4757/168","781/30","1136/51","2201/114","4331/240","2059/132","994/75","71/6","2911/288","142/15","2201/276","1247/187","2408/425","86/17","1763/408","344/85","1333/391"],"R47":["42097/238","290852/1785","283198/2023","275544/2261","271717/2380","264063/2618","256409/2737","252582/2975","244928/3213","9116/133","161809/2520","52417/924","152693/2898","25069/525","72928/1701","15953/432","18232/525","43301/1449","70649/2646","11395/483","473/14","3268/105","3182/119","3096/133","3053/140","2967/154","2881/161","2838/175","2752/189","301/24","2064/175","1634/161","1333/147","1290/161","1551/200","188/27","2303/384","141/25","893/184","1457/336","705/184"],"R57":["19437/104","11191/65","65379/442","1674/13","125457/1040","121923/1144","118389/1196","58311/650","9424/117","9207/133","72633/1120","6417/112","68541/1288","33759/700","2728/63","2387/64","6138/175","19437/644","10571/392","3999/152","3999/160","7719/352","93/5","403/24","1891/128","279/20","4371/368","1209/112","3441/368","299/33","1403/176","414/55","141/22","897/154","111/22","483/110"],"R67":["18183/91","83752/455","244644/1547","12528/91","117363/910","114057/1001","221502/2093","218196/2275","70528/819","3857/52","158688/2275","6003/98","64119/1127","63162/1225","20416/441","319/8","45936/1225","36366/1127","9889/343","3741/133","3741/140","7221/308","696/35","377/21","1769/112","522/35","4089/322","1131/98","3219/322","87/10","1403/180","184/25","94/15","598/105","74/15","322/75"],"R77":["31239/160","79299/476","309987/2128","309987/2240","598347/4928","7209/70","10413/112","146583/1792","21627/280","338823/5152","26244/455","729/14","133407/2912","19683/455","308367/8372","6561/196","242757/8372","6561/260","8181/350","150/7","1053/56","891/50","2511/161","1377/98","567/46","3807/350","135/14","1581/184","867/112","2499/368","2397/400","85/16"],"R87":["938817/3808","921591/4256","921591/4480","10179/56","869913/5600","7975/56","111969/896","94743/800","267003/2576","146421/1568","60291/736","5225/72","8151/128","48279/800","19437/368","10659/224","30723/736","29469/800","1045/32","23199/832","13761/400","1507/48","891/32","8613/368","2409/112","7029/368","6831/400","737/48","693/52","2673/224","99/10","3657/400","3551/432","371/52","1431/224","53/10"],"R97":["443303/1530","262363/1026","18094/75","642337/2970","1257533/6750","1239439/7290","9047/60","262363/2070","660431/5670","642337/6210","208081/2250","606149/7290","126658/1755","194967/2990","54531/910","159111/2990","154629/3250","5561/130","31374/845","60507/1820","8964/325","11537/360","9379/345","1577/63","2573/115","7553/375","7387/405","3154/195","3071/210","4648/375","249/23","2052/221","999/119","3024/425","2430/391","972/187","9/2"],"R107":["1054847/4200","347687/1512","819127/4032","665909/3864","559835/3528","182683/1288","76609/600","524477/4536","111967/1092","218041/2352","5893/75","293322/4025","41002/625","280706/4725","119852/2275","58349/1225","25232/625","28386/805","56772/1925","9047/294","8881/322","249/10","8549/378","1826/91","3569/196","2739/175","4399/322","3569/308","3403/336","1079/126","3975/506","3225/484","1025/176","325/66"],"R137":["1113/5","21672/115","872/5","17976/115","3528/25","5768/45","7392/65","516/5","11088/125","50568/625","248024/3375","105952/1625","7396/125","158928/3125","127624/2875","51772/1375","12341/375","31304/1125","3696/125","1568/65","22/1","476/25","84/5","798/55","77/6","1456/135","392/45","2915/384","689/108","371/72"],"R147":["63855/391","62436/425","26488/221","26015/238","473/5","1419/17","2451/34","399728/5967","196295/3213","7138/135","7138/153","67811/1683","196295/5508","371176/12393","99932/4131","8686/425","7052/391","172/11","473/34","5504/459","4472/459","2107/255","3328/459","2704/459","1274/255"],"R167":["1608/7","18693/100","19899/130","7839/56","60903/500","24723/230","10251/110","6633/80","737/10","11323/168","87971/1500","35711/690","14807/330","9581/240","13936/405","11323/405","42679/1800","11591/252","11323/300","737/24","737/30","1005/46","1675/88","4891/288","2345/162","1943/162","737/72"],"S37":["1102/7","722/5","2090/17","106/1","494/5","950/11","1862/23","1786/25","190/3","783/14","323/6","513/10","1485/34","1431/38","351/10","675/22","1323/46","1269/50","45/2","696/35","153/8","456/25","264/17","1272/95","312/25","120/11","1176/115","1128/125","8/1","34/5"],"S47":["201/1","924/5","2688/17","2604/19","1281/10","1218/11","2352/25","84/1","287/4","1943/28","336/5","319/5","1302/23","928/17","899/19","1769/40","841/22","812/25","29/1","1189/48","116/5","1728/85","899/46","1674/95","1647/100","783/55","1512/125","54/5","369/40","216/25","837/115"],"S57":["201/1","924/5","2688/17","2604/19","1281/10","1218/11","2352/25","84/1","287/4","1943/28","336/5","319/5","1302/23","928/17","899/19","1769/40","841/22","812/25","29/1","1189/48","116/5","1728/85","899/46","1674/95","1647/100","783/55","1512/125","54/5","369/40","216/25","837/115"],"S67":["3696/17","3612/19","903/5","1743/11","672/5","364/3","427/4","504/5","1974/23","78/1","1276/17","1554/23","1247/19","1247/20","294/5","2407/44","232/5","377/9","1769/48","174/5","1363/46","377/14","2322/95","1073/46","1161/50","2241/110","203/10","432/25","78/5","549/40","324/25","1269/115","351/35","999/115","189/25"],"S77":["4360/17","4280/19","214/1","2080/11","808/5","4000/27","130/1","616/5","2480/23","680/7","1960/23","376/5","4280/57","214/3","200/3","2080/33","740/13","808/15","4000/81","130/3","616/15","2480/69","680/21","1960/69","376/15","1717/75","200/9","1700/81","740/39","221/12","1309/75","1054/69","289/21","833/69","799/75","85/9","629/78"],"S87":["288/1","2840/11","1112/5","5480/27","180/1","3480/23","2920/21","2840/23","552/5","2680/27","456/5","1120/13","2698/33","540/7","5282/75","5206/81","64/1","57/1","1102/23","2774/63","2698/69","874/25","2546/81","1064/39","51/2","171/7","493/23","304/15","1241/63","1207/69","391/25","1139/81","476/39","153/14","136/15","544/69"],"S97":["1432/5","2360/9","695/3","4520/23","3800/21","3720/23","728/5","3560/27","1520/13","740/7","448/5","2183/27","1800/23","5143/72","720/11","4181/69","3515/63","1147/23","3367/75","3293/81","1406/39","1369/42","2072/75","475/18","555/23","1085/46","637/30","3115/162","665/39","185/12","196/15","525/46","105/11","595/72"],"F27":["4785/34","4389/34","63525/578","61215/646","3003/34","2625/34","56595/782","10857/170","1925/34","372855/7429","18291/391","175875/4301","344715/8993","66129/1955","1005/34","462/17","6720/289","6510/323","1281/68","3045/187","1176/85","210/17","1435/136","168/17","2257/240","1073/132","518/75","37/6","1517/288","74/15","1147/276"],"F37":["44080/343","5776/49","83600/833","4240/49","3952/49","38000/539","1520/23","14288/245","6490/119","7600/147","6254/133","1534/35","2950/77","826/23","5546/175","590/21","1003/42","2812/119","144/7","1349/70","1311/77","2546/161","2508/175","2432/189","133/12","1824/175","1444/161","1178/147","6499/874","3201/475","3104/513","4753/912","2328/475","97/23","3007/798"],"F47":["190950/1001","2280/13","364800/2431","18600/143","17385/143","165300/1573","12768/143","11400/143","19475/286","915/14","4350/77","48/1","300/7","1025/28","240/7","4650/161","6450/209","645/22","6225/242","240/11","650/33","1525/88","180/11","3525/253","975/77","2775/253","403/45","1891/240","186/25","1457/230","403/70","1147/230"],"F57":["236242/1183","155144/845","451328/2873","437224/3211","107543/845","204508/1859","394912/4225","14104/169","378572/5187","186233/2730","177074/3003","48848/975","12212/273","125173/3276","48848/1365","189286/6279","602/15","7568/221","7396/247","1849/65","3569/143","1376/65","172/9","2623/156","1032/65","4042/299","86/7","3182/299","754/81","1769/216","116/15","1363/207","377/63","1073/207"],"F67":["21983/96","93005/476","19135/112","72713/448","701765/4928","1691/14","109915/1008","515755/5376","5073/56","638685/8008","6156/91","855/14","156465/2912","4617/91","361665/8372","7695/196","284715/8372","2033/56","2470/77","1919/70","4750/189","1235/56","209/10","2945/161","1615/98","665/46","893/70","475/42","3515/364","1053/116","6237/725","5022/667","1377/203","3969/667","3807/725","135/29","2997/754"],"F77":["1972/7","3944/15","3161/14","52751/266","52751/280","12818/77","49793/350","24650/189","6409/56","5423/50","15283/161","8381/98","3451/46","32623/450","16150/243","4199/72","24871/450","10013/207","5491/126","15827/414","15181/450","1615/54","11951/468","1207/33","2363/75","2329/81","51/2","493/23","1241/63","1207/69","391/25","1139/81","476/39","153/14","2409/259","7029/851","6831/925","737/111","2772/481","2673/518","792/185"],"F87":["648005/2394","8938/35","317299/1386","621191/3150","612253/3402","4469/28","129601/966","326237/2646","317299/2898","102787/1050","299423/3402","8938/117","13407/196","17876/315","229149/4550","8241/182","6642/169","89667/2548","13284/455","5699/168","4633/161","3895/147","3813/161","533/25","3649/189","1558/91","1517/98","328/25","1845/161","738/77","7387/891","3154/429","3071/462","4648/825","1245/253","498/121"],"F97":["622741/2250","205261/810","483581/2160","393127/2070","9443/54","107849/690","316589/2250","309631/2430","66101/585","18389/180","841624/8625","20216/225","97412/1125","230888/2875","3479/46","677768/9375","662872/10125","283024/4875","19684/375","417088/9375","22344/575","44688/1375","2597/60","4214/115","1526/45","10486/345","686/25","10094/405","4312/195","301/15","2156/125","5194/345","2107/165","2009/180","3652/403","3569/434","5478/775","4399/713","3569/682","3403/744","1079/279"],"F107":["1272/5","24768/115","6976/35","20544/115","4032/25","6592/45","8448/65","4128/35","12672/125","57792/625","10176/115","283456/3375","121088/1625","59168/875","181632/3125","145856/2875","59168/1375","14104/375","35776/1125","4224/125","1792/65","176/7","544/25","96/5","912/55","44/3","1664/135","448/45","126/13","1197/143","385/52","56/9","196/39"],"F127":["62865/368","15367/100","9779/78","76835/672","23749/240","1397/16","2413/32","73787/1053","579755/9072","179197/3240","10541/216","200279/4752","579755/15552","137033/4374","73787/2916","1397/52","8255/336","12827/600","5207/276","2159/132","1397/96","1016/81","1651/162","1462/165","473/60","2752/405","2236/405","2107/450"],"F157":["1872/7","10881/50","891/5","4563/28","35451/250","14391/115","5967/55","3861/40","429/5","2197/28","17069/250","6929/115","2873/55","1859/40","5408/135","4394/135","8281/300","2249/42","2197/50","143/4","143/5","585/23","975/44","949/48","455/27","377/27","143/12"],"W10":["75/1","60/1","48/1","39/1","65/2","55/2","49/2","39/2","33/2","43/3","41/4","41/5","46/7"],"W20":["75/1","60/1","48/1","39/1","65/2","55/2","49/2","39/2","33/2","43/3","41/4","41/5","46/7"],"W30":["75/1","60/1","48/1","39/1","65/2","55/2","49/2","39/2","49/3","43/3","41/4","41/5","46/7"]};
function sewCatalog() {
  const out = [];
  const CAT = { ...SEW_CAT }; ['19', '29', '39', '49'].forEach(n => { CAT['KHF' + n] = SEW_CAT['KH' + n]; });
  Object.keys(CAT).forEach(t => CAT[t].forEach(s => {
    const [n, d, m] = s.split('/').map(Number), i = n / d, ri = Math.round(i * 10000) / 10000, kh = /^KH/.test(t);
    const nom = Math.round(i * 100) / 100;
    out.push({ id: 'sew-' + t.toLowerCase() + '-' + nom, _cat: true, ref: t + ' i=' + nom, marque: 'SEW', serie: 'SEW ' + t, ratio: ri,
      ...(kh && m ? { t2b: m } : {}),
      notes: 'Catalogue SEW (tableau nombre de dents, rapport exact ' + n + '/' + d + '). ' + (kh ? 'Mamax du tableau (ne=1400 tr/min) mis en T2B' + (/^KHF/.test(t) ? ' (tableau du KH de même taille : rapports identiques, Mamax à confirmer sur la plaque du KHF)' : '') + '. ' : 'T2B non fourni par ce tableau : à saisir (plaque ou catalogue SEW). ') + 'J_Gear et rendement à renseigner.' });
  }));
  return out;
}
const KEYS = ['motors', 'reducers', 'drives', 'axes', 'projects', 'hwtypes', 'iodict'];
const S = { db: null, motors: [], reducers: [], drives: [], axes: [], projects: [], hwtypes: [], iodict: [], projId: null, projForm: null, loaded: { motors: false, reducers: false, drives: false, axes: false, projects: false, hwtypes: false, iodict: false }, search: { motors: '', reducers: '', drives: '', hwtypes: '', iodict: '' }, serie: { motors: '', reducers: '', hwtypes: '', iodict: '' }, advOpen: false,
  tab: 'axes', axisId: null, draft: null, dirty: false, justSaved: false, lib: { motors: null, reducers: null, drives: null, hwtypes: null, iodict: null }, confirm: null };

/* ---------- Définition des champs ---------- */
const MOTOR_FIELDS = [
  { k: 'ref', l: 'Référence', t: 'text' },
  { k: 'serie', l: 'Série', t: 'text', h: 'Sert à regrouper la liste (ex. SH3 100)' },
  { k: 'typeMot', l: 'Type de moteur', t: 'select', o: [['sync', 'Synchrone (brushless, sur variateur servo)'], ['async', 'Asynchrone (réseau ou variateur)']] },
  { k: 'marque', l: 'Fabricant', t: 'text', only: 'async', h: 'Plaque ou colonne Fabricant du dossier (Leroy-Somer, SEW, Nord, Bonfiglioli…)' },
  { k: 'tension', l: 'Tension (plaque)', t: 'text', only: 'async', h: 'ex. 230/400 V (Δ 230 V ou Y 400 V). Sur un ATV320 N4 (réseau 400 V) : UNS = 400 V ; sur un M2 / M3 : 230 V' },
  { k: 'pNom', l: 'Puissance nominale', u: 'kW', h: 'Plaque. Asynchrone sur ATV320 : paramètre NPR' },
  { k: 'freq', l: 'Fréquence nominale', u: 'Hz', only: 'async', h: 'Plaque, en principe 50 Hz : paramètre FRS' },
  { k: 'kt', l: 'Kt (TorqueConstant)', u: 'Nm/A', only: 'sync', h: 'Vide : calculé avec M0 ÷ I0' },
  { k: 'ke', l: 'Constante FCEM ke', u: 'V / 1000 tr/min', only: 'sync', h: 'Moteur synchrone sur ATV320 (loi SYN) : paramètre PHS. Catalogue : « FCEM », « back EMF constant » (BMP : manuel moteur)' },
  { k: 'jMotor', l: 'Inertie (MotorInertia)', u: 'kg·cm²', conv: true },
  { k: 'm0', l: 'Couple M0', la: 'Couple nominal MN', u: 'Nm', ha: 'Plaque ou catalogue. Vide : calculé avec P ÷ ω' },
  { k: 'i0', l: 'Courant I0', la: 'Courant nominal IN (couplage 400 V)', u: 'A', ha: 'Plaque, colonne 400 V (couplage Y) : paramètre NCR et ITH de l’ATV320' },
  { k: 'iNom230', l: 'Courant nominal IN (couplage 230 V, Δ)', u: 'A', only: 'async', h: 'Plaque, colonne 230 V. Vide : IN 400 V × √3' },
  { k: 'imax', l: 'Courant crête Imax', la: 'Courant de démarrage Id (démarrage direct)', u: 'A', h: 'Plaque moteur', ha: 'Catalogue : Id/In × IN. Sans objet sur variateur (le courant est limité par l’ATV320)' },
  { k: 'cosPhi', l: 'cos φ', u: '', only: 'async', h: 'Plaque : paramètre COS de l’ATV320' },
  { k: 'rendement', l: 'Rendement', u: '%', only: 'async', h: 'Plaque (IE3 : ~80 à 90 %)' },
  { k: 'nNom', l: 'Vitesse nominale', u: 'tr/min', ha: 'Plaque (ex. 1440 tr/min pour un 4 pôles à 50 Hz) : paramètre NSP' },
  { k: 'nMax', l: 'Vitesse max', u: 'tr/min' },
  { k: 'paires', l: 'Paires de pôles', u: '', h: 'Pour un moteur sur ATV320 : fréquence (Hz) = vitesse (tr/min) × paires de pôles ÷ 60. BMP : 5 paires (3000 tr/min = 250 Hz)', ha: '4 pôles = 2 paires (1500 tr/min synchrone à 50 Hz), 2 pôles = 1 paire (3000). Vide : déduit de la vitesse nominale' },
  { k: 'frein', l: 'Frein intégré', t: 'bool' },
  { k: 'sonde', l: 'Sonde thermique', t: 'text' },
  { k: 'notes', l: 'Notes', t: 'area' }
];
const REDUCER_FIELDS = [
  { k: 'ref', l: 'Référence / type', t: 'text' },
  { k: 'marque', l: 'Marque', t: 'text' },
  { k: 'serie', l: 'Série', t: 'text', h: 'Sert à regrouper la liste (ex. Neugart PLFN 090)' },
  { k: 'ratio', l: 'Rapport i', u: ':1' },
  { k: 't2n', l: 'T2N couple nominal', u: 'Nm' },
  { k: 't2b', l: 'T2B couple max (ou Mamax)', u: 'Nm', h: 'Sert à la limite de courant' },
  { k: 't2not', l: 'T2Not arrêt d’urgence', u: 'Nm' },
  { k: 'jGear', l: 'Inertie côté entrée (J_Gear)', u: 'kg·cm²', conv: true },
  { k: 'rendement', l: 'Rendement', u: '%' },
  { k: 'gearIn', l: 'GearIn exact (nombre de dents)', t: 'text', h: 'Entier. Vide : déduit du rapport (tableau SEW, rapport entier ou fraction du rapport catalogue)' },
  { k: 'gearOut', l: 'GearOut exact (nombre de dents)', t: 'text', h: 'Entier. GearOut ÷ GearIn = rapport exact' },
  { k: 'integre', l: 'Réducteur intégré au moteur (tambour moteur) : rendement compté dans la limite', t: 'bool' },
  { k: 'notes', l: 'Notes', t: 'area' }
];
// GearIn / GearOut entiers : saisie manuelle > « rapport exact n/d » des notes > tableau des dents SEW > rapport entier > fraction du rapport catalogue (arrondi)
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
function gearsOf(r) {
  if (!r) return null;
  const ratio = num(r.ratio), gi = parseInt(r.gearIn, 10), go = parseInt(r.gearOut, 10);
  if (gi > 0 && go > 0) return { gIn: gi, gOut: go, src: 'saisi', exact: true };
  const m = /rapport exact\s*(\d+)\s*\/\s*(\d+)/i.exec(String(r.notes || ''));
  if (m) { const n = +m[1], d = +m[2], g = gcd(n, d); return { gIn: d / g, gOut: n / g, src: 'notes', exact: true }; }
  if (!ratio) return null;
  if (/^sew$/i.test(String(r.marque || ''))) {
    const t = (/^sew-([a-z]+)(\d+)/i.exec(String(r.id || '')) || /\b(KHF|KH|K|R|S|F|W)(\d{2,3})\b/i.exec(String(r.serie || '') + ' ' + String(r.ref || '')));
    if (t) {
      const L = t[1].toUpperCase(), N = t[2], cand = [L + N, L.replace('F', '') + N, L.replace('H', '').replace('F', '') + N, 'KH' + N].filter(k => SEW_CAT[k]);
      if (cand.length) {
        const hits = SEW_CAT[cand[0]].map(x => x.split('/').map(Number)).filter(([n, d]) => Math.abs(n / d - ratio) <= Math.max(0.006, ratio * 2e-4));
        hits.sort((a, b) => Math.abs(a[0] / a[1] - ratio) - Math.abs(b[0] / b[1] - ratio));
        if (hits.length) { const [n, d] = hits[0], g = gcd(n, d); return { gIn: d / g, gOut: n / g, src: 'sew', exact: true, table: cand[0] }; }
        var near = SEW_CAT[cand[0]].map(x => x.split('/').map(Number)).filter(([n, d]) => Math.abs(n / d - ratio) <= ratio * 1e-3).sort((a, b) => Math.abs(a[0] / a[1] - ratio) - Math.abs(b[0] / b[1] - ratio))[0];
        if (near) near = { n: near[0], d: near[1], table: cand[0] };
      }
    }
  }
  if (Number.isInteger(ratio)) return { gIn: 1, gOut: ratio, src: 'entier', exact: true };
  const dec = (String(ratio).split('.')[1] || '').length, den = Math.pow(10, Math.min(dec, 4)), num_ = Math.round(ratio * den), g = gcd(num_, den);
  return { gIn: den / g, gOut: num_ / g, src: 'catalogue', exact: false, small: den / g <= 8, near: typeof near !== 'undefined' ? near : null };
}
const gearsNote = G => !G ? '' : G.src === 'catalogue' ? (G.near ? `fraction du rapport catalogue. Le tableau des dents SEW ${G.near.table} donne ${G.near.n}/${G.near.d} = ${fmt(G.near.n / G.near.d, 4)} : vérifier le rapport exact (confirmation de commande SEW) avant de choisir` : G.small ? 'fraction du rapport catalogue, probablement exacte : à confirmer (plaque ou fabricant)' : 'fraction du rapport catalogue, arrondi : demander le rapport exact (nombre de dents) au fabricant') : G.src === 'sew' ? 'rapport exact (tableau des dents SEW ' + G.table + ')' : G.src === 'notes' ? 'rapport exact, nombre de dents (fiche réducteur)' : G.src === 'saisi' ? 'saisi dans la fiche réducteur' : 'rapport entier';
const isIntegre = r => !!r && (r.integre ?? /^Interroll DM/i.test(String(r.serie || '')));
const DRIVE_FIELDS = [
  { k: 'ref', l: 'Référence', t: 'text', h: 'Début de la référence du dossier (ATV320U06N4 pour ATV320U06N4C, LXM62DU60 pour LXM62DU60C21000) : le dossier est rattaché à la fiche dont la référence est le début de la sienne' },
  { k: 'serie', l: 'Série', t: 'text' },
  { k: 'iPeak', l: 'Courant max (Imax)', u: 'A', h: 'Lexium 62 : MaxDrivePeakCurrent. ATV320 : surcharge transitoire 150 % de In pendant 60 s' },
  { k: 'iNom', l: 'Courant nominal / permanent (In)', u: 'A', h: 'Lexium 62 : courant permanent à 8 kHz. ATV320 : courant nominal de sortie' },
  { k: 'puissance', l: 'Puissance', u: 'kW' },
  { k: 'tension', l: 'Tension', t: 'text', h: 'ATV320 : N4 = 380–500 V triphasé, M2 = 200–240 V monophasé, M3 = 200–240 V triphasé' },
  { k: 'format', l: 'Format', t: 'text', h: 'Simple ou double axe' },
  { k: 'notes', l: 'Notes', t: 'area' }
];
// g : jauges de couple que la case fait bouger (lim = UserCurrentLimit calculé, ucl = réglage actuel, hold = maintien, stop = arrêt d'urgence)
const GAUGES = {
  lim: { l: 'UserCurrentLimit calculé', dep: 'Moteur · Réducteur · Part de T2B' },
  ucl: { l: 'UserCurrentLimit réglé', dep: 'UserCurrentLimit déjà réglé · Moteur · Réducteur' },
  hold: { l: 'Maintien de la charge', dep: 'Masse · FeedConstant · Axe vertical · Réducteur' },
  stop: { l: 'Arrêt d’urgence', dep: 'Courant d’arrêt imposé · Moteur · Réducteur' }
};
const AXIS_GROUPS = [
  { t: 'Axe', f: [
    { k: 'nom', l: 'Nom de l’axe', t: 'text' },
    { k: 'desc', l: 'Désignation', t: 'text', h: 'Ce que fait l’axe sur la machine (du dossier élec). Affichée sous le nom dans les listes' } ] },
  { t: 'Moteur et réducteur', f: [
    { k: 'moteurId', l: 'Moteur', t: 'motor', g: ['lim', 'ucl', 'stop'] },
    { k: 'reducteurId', l: 'Réducteur', t: 'reducer', g: ['lim', 'ucl', 'hold', 'stop'] } ] },
  { t: 'Charge', f: [
    { k: 'typeCharge', l: 'Type de charge', t: 'select', o: [['lineaire', 'Linéaire (courroie, bande, crémaillère)'], ['convoyeur', 'Convoyeur (rouleau d’entraînement)'], ['rotatif', 'Rotative (plateau, pivot)'], ['bielle', 'Bielle-manivelle (rotation continue)']] },
    { k: 'dRouleau', l: 'Diamètre du rouleau d’entraînement', u: 'mm', show: 'convoyeur', h: 'Donne le FeedConstant théorique : π × diamètre, en mm par tour de sortie du réducteur', n: 'FeedConstant laissé vide : π × diamètre', g: ['hold'] },
    { k: 'feed', l: 'FeedConstant', u: 'Units/tr', h: 'Déplacement par tour de sortie du réducteur (360 pour un axe en degrés)', g: ['hold'] },
    { k: 'masse', l: 'Masse en mouvement', u: 'kg', show: ['lineaire', 'convoyeur'], g: ['hold'] },
    { k: 'jLoadDirect', l: 'Inertie de la charge', u: 'kg·cm²', show: 'rotatif', h: 'Côté sortie du réducteur', conv: true },
    { k: 'rManiv', l: 'Rayon de la manivelle', u: 'mm', show: 'bielle', h: 'Distance entre l’axe moteur et le maneton. Course de la plaque = 2 × rayon' },
    { k: 'lBielle', l: 'Longueur de la bielle', u: 'mm', show: 'bielle', h: 'Entraxe maneton / articulation de la plaque. Vide : bielle très longue (sans correction)' },
    { k: 'mPlaque', l: 'Masse de la plaque et de ce qu’elle porte', u: 'kg', show: 'bielle', h: 'Tout ce qui coulisse sur les rails' },
    { k: 'mBielle', l: 'Masse de la bielle', u: 'kg', show: 'bielle', h: 'Vide : bielle négligée. La moitié tourne avec le maneton, l’autre moitié suit la plaque' },
    { k: 'jManiv', l: 'Inertie de la manivelle', u: 'kg·cm²', show: 'bielle', h: 'Bras, contrepoids, maneton, côté sortie du réducteur. Vide : négligée', conv: true },
    { k: 'jSupp', l: 'Inertie ajoutée', u: 'kg·cm²', h: 'Poulies, rouleaux, accouplement… côté sortie du réducteur. Vide : rien', conv: true },
    { k: 'vertical', l: 'Axe vertical (charge qui tombe)', t: 'bool', show: 'lineaire', g: ['hold'] } ] },
  { t: 'Arrêt d’urgence', f: [
    { k: 'vMax', l: 'Vitesse max du cycle', u: 'Units/s', h: 'Vitesse la plus élevée atteinte par le mouvement programmé. Sert à calculer ControllerStopDec, ControllerStopJerk et StopTimeLim', n: 'Celle du mouvement, pas du moteur' },
    { k: 'tStop', l: 'Durée d’arrêt visée', u: 's', h: '0,15 à 0,2 s en général' } ] },
  { t: 'Contrôle réducteur', f: [
    { k: 'marge', l: 'Part de T2B autorisée', u: '%', h: 'Part du couple max du réducteur que le moteur a le droit de demander. 80 % = marge de 20 %. Fixe aussi le seuil vert / orange des jauges', g: ['lim'] } ] },
  { adv: true, t: 'Variateur dans Machine Expert', note: 'Aussi dans l’onglet Brushless, où se règlent l’ordre Sercos, le codeur et la carte IO.', f: [
    { k: 'gamme', l: 'Variateur', t: 'select', o: [['', 'Aucun (axe virtuel : Master, MC_Cut…)'], ['LXM62', 'LXM62 (module en armoire)'], ['ILM62', 'ILM62 (intégré au moteur)'], ['BMP', 'Sur ATV320 : asynchrone, BMP, tambour NGI / Interroll (CANopen, pas de Sercos)']], h: 'Dit au script ce qu’il crée pour cet axe : le variateur DRV_, le codeur LE_ et la carte IO_. « Aucun » : rien n’est créé' },
    { k: 'variateur', l: 'Référence', t: 'text', h: 'Référence complète du dossier élec (ex. LXM62DD15C21000). Vide pour un ILM62' },
    { k: 'ioCard', l: 'Carte IO_ sur le variateur', t: 'bool', h: 'Le script crée la carte IO sous le variateur et renomme ses voies TP_, DQ_, DI_ + nom de l’axe' } ] },
  { t: 'ATV320', bmp: true, note: 'LSP, HSP et ITH sont calculés à partir du moteur, du rapport et des vitesses du cycle (Vitesse max du cycle ci-dessus).', f: [
    { k: 'vMin', l: 'Vitesse basse du cycle', u: 'Units/s', h: 'Petite vitesse utilisée par le cycle (approche, jog, vitesse lente) : donne LSP en Hz. Vide ou 0 : LSP = 0' },
    { k: 'ithPct', l: 'ITH', u: '% de IN', h: 'Courant thermique moteur réglé dans l’ATV320, en % du courant nominal IN du moteur. 100 % = IN (valeur usuelle). Baisser si le moteur est mal ventilé ou tourne lentement en continu' } ] },
  { adv: true, t: 'Mouvement', f: [
    { k: 'acc', l: 'Accélération programmée', u: 'Units/s²' },
    { k: 'periode', l: 'Période d’oscillation', u: 's', h: 'Donne le jerk du mouvement' } ] },
  { t: 'Gains retenus après essais', lx: true, f: [
    { k: 'velPRetenu', l: 'Vel_P_Gain retenu', u: '', h: 'Valeur gardée après les essais sur la machine. Vide : l’outil propose une valeur de départ' },
    { k: 'velIRetenu', l: 'Vel_I_Gain retenu', u: '', h: 'Valeur gardée après les essais sur la machine. Vide : l’outil propose une valeur de départ' } ] },
  { adv: true, lx: true, t: 'Transposer des gains existants', f: [
    { k: 'velPActuel', l: 'Vel_P_Gain actuel', u: '', h: 'Avec J_Load et J_Gear actuels : propose un Vel_P_Gain adapté à la nouvelle inertie' },
    { k: 'jLoadActuel', l: 'J_Load actuel', u: 'kg·cm²', conv: true },
    { k: 'jGearActuel', l: 'J_Gear actuel', u: 'kg·cm²', conv: true } ] },
  { adv: true, t: 'Notes', f: [{ k: 'notes', l: 'Notes', t: 'area' }] }
];
const NUM_KEYS = new Set();
const HW_FAMS = ['Variateur Sercos', 'Carte IO', 'Codeur', 'Alimentation', 'Tête de bus TM5', 'Module TM5', 'CAN', 'Variateur CAN', 'Ethernet/IP', 'Autre'];
const HWTYPE_FIELDS = [
  { k: 'ref', l: 'Type', t: 'text', h: 'Nom du type pour le script et dans le dossier élec (colonne Référence de « Matériels »), ex. TM5SDI12D' },
  { k: 'serie', l: 'Famille', t: 'select', o: HW_FAMS.map(f => [f, f]) },
  { k: 'devType', l: 'DeviceID : type', u: '', h: 'Premier nombre du DeviceID, ex. 72 pour un module TM5' },
  { k: 'devId', l: 'DeviceID : identifiant', t: 'text', h: 'Ex. 1_0x1b95. plc_id = celui de l’automate du projet' },
  { k: 'devVer', l: 'DeviceID : version', t: 'text', h: 'Ex. 1.56.15.2. plc_v = version de l’automate du projet' },
  { k: 'module', l: 'Module', t: 'text', h: 'Quatrième paramètre de add() (ex. LXM62DxS), souvent vide' },
  { k: 'parent', l: 'Parent', t: 'text', h: 'Appareil sous lequel le créer : LMC_PacDrive, Sercos_Master, CAN_Manager, EIPS_Scanner. TM5NS31 = sous la tête de bus TM5 qui le précède (BC_TM5NS31, ancien nom de la tête, revient au même)' },
  { k: 'nomAuto', l: 'Nom dans l’automate', t: 'text', ph: '{dossier}', h: 'Modèle du nom que le script donne à l’appareil dans Machine Expert, pour tous les projets. {dossier} = nom donné par le dossier élec (colonne C des « Matériels », sinon colonne B + repère ; repère du moteur pour un ATV320), {n} = numéro d’ordre de ce type dans le projet, {ilot} = numéro de l’îlot TM5 (1 par tête de bus), {type} = la référence. Vide = {dossier}. Pour un seul projet, « Renommer » dans Matériel du projet. Variateurs, cartes IO et codeurs des axes : toujours DRV_, IO_, LE_ + repère de l’axe (convention Auto_Pannel)' },
  { k: 'alias', l: 'Autres références du dossier élec', t: 'text', h: 'Références qui donnent ce type, séparées par des virgules ; le début de la référence suffit (ex. LXM62PD)' },
  { k: 'voiesE', l: 'Voies d’entrée', u: '', h: 'Pour le futur mapping des E/S' },
  { k: 'voiesS', l: 'Voies de sortie', u: '', h: 'Pour le futur mapping des E/S' },
  { k: 'notes', l: 'Notes', t: 'area' }
];
[...MOTOR_FIELDS, ...REDUCER_FIELDS, ...DRIVE_FIELDS, ...HWTYPE_FIELDS, ...AXIS_GROUPS.flatMap(g => g.f)].forEach(f => { if (!f.t) NUM_KEYS.add(f.k); });

/* ---------- Calculs ---------- */
// Inertie vue par l'axe de la manivelle : J(θ) = Jmanivelle + mrot·r² + m·r²·f(θ)², f = sinθ·(1 + λ·cosθ / √(1 − λ²·sin²θ))
function bielleCalc(a) {
  const r = (num(a.rManiv) ?? 0) / 1000, l = (num(a.lBielle) ?? 0) / 1000, mp = num(a.mPlaque) ?? 0, mb = num(a.mBielle) ?? 0, Jc = (num(a.jManiv) ?? 0) * 1e-4;
  if (!(r > 0) || !(mp + mb > 0)) return null;
  const lam = l > r ? r / l : 0, mAlt = mp + mb / 2, mRot = mb / 2, base = Jc + mRot * r * r;
  const J = th => { const s = Math.sin(th), c = Math.cos(th), f = s * (1 + lam * c / Math.sqrt(1 - lam * lam * s * s)); return base + mAlt * r * r * f * f; };
  let Jmax = 0, thMax = 0, sum = 0, dJmax = 0, N = 0; const st = Math.PI / 720;
  for (let th = 0; th <= 2 * Math.PI + 1e-9; th += st) { const j = J(th); sum += j; N++; if (j > Jmax) { Jmax = j; thMax = th * 180 / Math.PI; } const d = Math.abs(J(th + 1e-4) - J(th - 1e-4)) / 2e-4; if (d > dJmax) dJmax = d; }
  return { Jmax, Jmean: sum / N, thMax: thMax > 180 ? 360 - thMax : thMax, dJmax, course: 2 * r, base };
}
const ackKey = c => c[3] || String(c[1] || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[0-9.,%]+/g, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
const ackDate = t => t ? new Date(t).toLocaleDateString('fr-FR') : '';
function compute(a) {
  const m = S.motors.find(x => x.id === a.moteurId); let r = S.reducers.find(x => x.id === a.reducteurId);
  if (!m) return { missing: true };
  /* axe sur ATV320 sans réducteur (tambour sans réduction, entraînement direct) : rapport 1, rien à contrôler côté réducteur */
  if (!r) { if (a.gamme !== 'BMP') return { missing: true }; r = { ratio: 1, rendement: 100, ref: 'sans réducteur (i = 1)', _virt: true }; }
  const R = { m, r, checks: [], calc: [], atv: a.gamme === 'BMP', async: m.typeMot === 'async', sansRed: !!r._virt };
  const i = num(r.ratio), eta = (num(r.rendement) ?? 100) / 100;
  // asynchrone : Kt équivalent = MN ÷ IN (couple nominal sur courant nominal, loi vectorielle de l'ATV320)
  const kt = num(m.kt) ?? ((num(m.m0) && num(m.i0)) ? num(m.m0) / num(m.i0) : null);
  const Jm = num(m.jMotor) ?? 0, Jg = num(r.jGear) ?? 0;
  const tc = a.typeCharge || 'lineaire', conv = tc === 'convoyeur';
  const lin = tc === 'lineaire' || conv;   // convoyeur = charge linéaire entraînée par un rouleau
  const dRoul = conv ? num(a.dRouleau) : null;
  const feedTheo = dRoul ? Math.round(Math.PI * dRoul * 1000) / 1000 : null;
  const feed = num(a.feed) ?? feedTheo ?? (lin ? null : 360);
  if (!i || !kt) { R.missing = true; R.why = !i ? 'Le réducteur n’a pas de rapport.' : 'Le moteur n’a ni Kt ni M0/I0.'; return R; }
  const rmm = feed ? feed / (2 * Math.PI) : null;
  const masse = num(a.masse) ?? 0, jSupp = num(a.jSupp) ?? 0;
  const bie = a.typeCharge === 'bielle', BI = bie ? bielleCalc(a) : null;
  const JLcharge = lin ? (rmm ? masse * rmm * rmm / 100 : 0) : bie ? (BI ? BI.Jmax * 1e4 : 0) : (num(a.jLoadDirect) ?? 0);
  const JL = JLcharge + jSupp;
  const JLm = JL / (i * i), Jtot = Jm + Jg + JLm;
  Object.assign(R, { bielle: BI, i, eta, kt, Jm, Jg, JL, JLm, Jtot, lin, conv, dRoul, feedTheo, feedSaisi: num(a.feed), feed, rmm, ratioIn: Jm ? JLm / Jm : null, ratioTot: (Jm + Jg) > 0 ? JLm / (Jm + Jg) : null });

  // Référence du 100 % de UserCurrentLimit : courant max du moteur (le variateur n'intervient pas).
  // Axe BMP sur ATV320 : le courant max est aussi borné par l'ATV320 du dossier (fiche Variateurs, Imax = 150 % de In)
  // asynchrone sur ATV320 : le courant max utilisable est celui du variateur (150 % de In pendant 60 s), pas le courant de démarrage direct
  const imax = R.async ? (num(m.i0) ? Math.round(num(m.i0) * 150) / 100 : null) : num(m.imax), drv = R.atv ? driveOf(a.variateur) : null, iDrv = drv ? num(drv.iPeak) : null;
  const Iref = imax && iDrv ? Math.min(imax, iDrv) : (imax || iDrv || null);
  R.drv = drv; R.iDrv = iDrv; R.iDrvNom = drv ? num(drv.iNom) : null; R.refLim = iDrv && (!imax || iDrv < imax) ? 'atv' : (imax ? 'moteur' : null);
  const t2b = num(r.t2b), t2n = num(r.t2n), t2not = num(r.t2not);
  const marge = (num(a.marge) ?? 80) / 100;
  // Réducteur intégré (tambour moteur) : le fabricant donne les couples de sortie rendement compris → on divise par le rendement
  const integ = isIntegre(r), etaT = integ ? eta : 1;
  const I_T2B = t2b ? t2b / i / kt / etaT : null, I_T2N = t2n ? t2n / i / kt / etaT : null, I_T2Not = t2not ? t2not / i / kt / etaT : null;
  let Ilim = I_T2B ? I_T2B * marge : Iref;
  if (Iref && Ilim) Ilim = Math.min(Ilim, Iref);
  if (!Ilim) Ilim = null;
  const pct = Iref && Ilim ? Math.floor(Ilim / Iref * 1000) / 10 : null;
  R.gears = gearsOf(r);
  Object.assign(R, { integ, etaT, m0: num(m.m0), i0: num(m.i0), Iref, I_T2B, I_T2N, I_T2Not, Ilim, pct, marge });

  const vertical = tc === 'lineaire' && !!a.vertical;
  let Ihold = 0;
  if (vertical && rmm) Ihold = masse * 9.81 * (rmm / 1000) / i / eta / kt;
  const kAcc = feed ? Jtot * 1e-4 * (2 * Math.PI / feed) * i / kt : null; // A par Unit/s²
  const vMax = num(a.vMax), acc = num(a.acc);
  const accMax = kAcc && Ilim ? (Ilim - Ihold) / kAcc : null;
  const Iacc = kAcc && acc ? Ihold + kAcc * acc : null;
  const vPhys = num(m.nMax) && feed ? num(m.nMax) / 60 / i * feed : null;
  Object.assign(R, { vertical, Ihold, kAcc, accMax, Iacc, vPhys, vMax, acc });

  // Arrêt d'urgence
  const tStop = num(a.tStop) ?? 0.2;
  const iStopMa = null; // DriveStopCurrentLimit toujours déduit de la part de T2B autorisée
  const stopCapped = !!(iStopMa && Ilim && iStopMa / 1000 > Ilim + 1e-9);
  // Réducteur intégré : au freinage le rendement ne protège plus le réducteur → courant d'arrêt calculé sans rendement
  const IlimStop = integ && t2b && Ilim ? Math.min(Ilim, t2b / i / kt * marge) : Ilim, stopIntegCut = integ && IlimStop != null && Ilim != null && IlimStop < Ilim - 1e-9;
  const IstopA = iStopMa ? (IlimStop ? Math.min(iStopMa / 1000, IlimStop) : iStopMa / 1000) : IlimStop;
  let dec = null, decLimited = false, jerkStop = null, tArret = null, stl = null, dist = null;
  if (vMax) {
    const decV = vMax / tStop, decCur = IstopA && kAcc ? (IstopA - Ihold) / kAcc * 0.9 : Infinity;
    dec = decV; if (decCur > 0 && decCur < decV) { dec = decCur; decLimited = true; }
    dec = nice(dec);
    jerkStop = nice(dec / 0.03);
    tArret = vMax / dec + 0.03;
    stl = Math.max(400, Math.ceil(tArret * 1.25 * 1000 / 50) * 50);
    dist = vMax * vMax / (2 * dec) + vMax * 0.015;
  }
  const driveStopMa = iStopMa ? Math.round(IstopA * 1000) : (IstopA ? Math.floor(IstopA * 10) * 100 : null);
  Object.assign(R, { stopIntegCut, stopCapped, tStop, dec, decLimited, jerkStop, tArret, stl, dist, driveStopMa, IstopA });

  // Couples vus par le réducteur (sans rendement : cas le plus défavorable pour le réducteur ; avec rendement si réducteur intégré au moteur)
  const Tout = I => I != null ? I * kt * i * etaT : null;
  const pctOf = I => Iref && I != null ? I / Iref * 100 : null;
  const ucl = null, Iucl = ucl != null && Iref ? ucl / 100 * Iref : null;
  const TR = [];
  if (t2n) TR.push({ l: 'T2N · couple nominal', t: t2n, I: I_T2N, ref: true });
  if (t2b) TR.push({ l: 'T2B · couple max', t: t2b, I: I_T2B, ref: true });
  if (t2not) TR.push({ l: 'T2Not · arrêt d’urgence', t: t2not, I: I_T2Not, ref: true });
  if (Ilim) TR.push({ l: `Limite calculée (${fmt(pct, 1)} %)`, t: Tout(Ilim), I: Ilim, hl: true });
  if (Iucl != null) TR.push({ l: `Réglage variateur (${fmt(ucl, 1)} %)`, t: Tout(Iucl), I: Iucl, hl: true });
  if (vertical && Ihold) TR.push({ l: 'Maintien de la charge', t: Ihold * kt * i * eta, I: Ihold });
  if (IstopA && iStopMa) TR.push({ l: `Arrêt d’urgence (${fmt(Math.round(IstopA * 1000), 0)} mA)`, t: Tout(IstopA), I: IstopA });
  TR.forEach(x => { x.tm = x.t != null ? x.t / i / etaT : null; x.pc = pctOf(x.I) != null ? Math.floor(pctOf(x.I) * 10 + 1e-9) / 10 : null; x.pT2B = t2b && x.t != null ? x.t / t2b * 100 : null; });
  Object.assign(R, { TR, ucl, Iucl, Tucl: Tout(Iucl), t2n, t2b, t2not, Tlim: Tout(Ilim) });

  // Jerk du mouvement
  const per = num(a.periode);
  R.jerkMove = per && acc ? nice(acc / per) : null;

  // Gains proposés : base Schneider réduite selon le rapport d'inertie charge/moteur (valable si J_Load et J_Gear sont saisis comme calculés)
  const rr = Math.max(0, R.ratioIn ?? 0);
  R.velPSugg = Math.min(GAIN_BASE.p, Math.max(1, Math.round(GAIN_BASE.p / Math.pow(1 + rr, GAIN_BASE.expP) * 2) / 2));
  R.velISugg = Math.min(GAIN_BASE.i, Math.max(0.2, Math.round(GAIN_BASE.i / Math.pow(1 + rr, GAIN_BASE.expI) * 10) / 10));

  // Transposition des gains
  const vpA = num(a.velPActuel);
  if (vpA != null && (a.jLoadActuel !== '' && a.jLoadActuel != null)) {
    const Jold = Jm + (num(a.jGearActuel) ?? 0) + (num(a.jLoadActuel) ?? 0) / (i * i);
    R.gainFactor = Jold / Jtot; R.Jold = Jold;
    R.velPTransp = Math.round(vpA * R.gainFactor * 10) / 10;
  }

  // Vérifications
  const C = R.checks;
  if (conv && !feed) C.push(['warn', 'Convoyeur : saisir le diamètre du rouleau d’entraînement (ou le FeedConstant) pour calculer l’inertie et les vitesses.']);
  if (conv && feedTheo && R.feedSaisi != null && Math.abs(R.feedSaisi - feedTheo) / feedTheo > 0.005)
    C.push(['info', `FeedConstant saisi ${fmt(R.feedSaisi, 3)} ≠ théorique ${fmt(feedTheo, 3)} (π × ${fmt(dRoul, 1)} mm) : normal s’il a été recalé sur la machine (bande, glissement). C’est la valeur saisie qui est utilisée.`]);
  if (bie) {
    if (!BI) C.push(['warn', 'Bielle-manivelle : saisir le rayon de la manivelle et la masse de la plaque pour calculer l’inertie.']);
    else {
      const om = vMax && feed ? vMax * 2 * Math.PI / feed : null;
      if (om) { BI.omega = om; BI.Tpk = 0.5 * om * om * BI.dJmax; BI.rpm = om * 60 / (2 * Math.PI);
        if (t2b && BI.Tpk > t2b * marge) C.push(['warn', `Bielle-manivelle : le couple lié à la variation d’inertie atteint environ ${fmt(BI.Tpk, 1)} Nm à ${fmt(BI.rpm, 0)} tr/min, au-dessus de ${fmt(t2b * marge, 1)} Nm autorisés.`]);
        else C.push(['info', `Bielle-manivelle : couple de pointe lié à la variation d’inertie ≈ ${fmt(BI.Tpk, 1)} Nm à ${fmt(BI.rpm, 0)} tr/min (en plus du frottement).`]); }
    }
  }
  if (vertical && !m.frein) C.push(['crit', 'Axe vertical sans frein moteur : la charge tombe à chaque coupure de couple.']);
  if (vertical && Ihold > Ilim) C.push(['crit', `Le maintien demande ${fmt(Ihold)} A, plus que la limite de ${fmt(Ilim)} A : l’axe ne peut pas tenir la charge.`]);
  if (stopCapped) C.push(['warn', `Courant d’arrêt imposé (${fmt(iStopMa, 0)} mA) au-dessus de la limite liée à la part de T2B autorisée : ramené à ${fmt(driveStopMa, 0)} mA.`]);
  if (vertical && iStopMa && IstopA <= Ihold) C.push(['crit', `La limite d’arrêt (${fmt(iStopMa, 0)} mA) est sous le courant de maintien (${fmt(Ihold)} A) : la charge tombe pendant l’arrêt.`]);
  if (vPhys && vMax && vMax > vPhys) C.push(['crit', `Vitesse programmée ${fmt(vMax, 0)} au-delà du maximum moteur (${fmt(vPhys, 0)} Units/s).`]);
  if (R.Tucl != null && t2b && R.Tucl > t2b) C.push(['crit', `Le UserCurrentLimit réglé (${fmt(ucl, 1)} %) laisse passer ${fmt(R.Tucl, 0)} Nm en sortie, au-delà du T2B (${fmt(t2b, 0)} Nm) : risque de casse du réducteur. Descendre à ${fmt(pct, 1)} %.`]);
  else if (R.Tucl != null && t2b && R.Tucl > t2b * marge) C.push(['warn', `Le UserCurrentLimit réglé (${fmt(ucl, 1)} %) donne ${fmt(R.Tucl, 0)} Nm en sortie, soit ${fmt(R.Tucl / t2b * 100, 0)} % du T2B : au-dessus de la marge choisie.`]);
  if (t2not && R.Tlim != null && R.Tlim > t2not) C.push(['crit', `La limite de courant laisse passer ${fmt(R.Tlim, 0)} Nm en sortie, au-delà du T2Not (${fmt(t2not, 0)} Nm) : baisser la part de T2B autorisée ou vérifier le T2B.`]);
  else if (t2b && t2not && t2b > t2not) C.push(['warn', `T2B (${fmt(t2b, 0)} Nm) au-dessus du T2Not (${fmt(t2not, 0)} Nm). La limite réglée reste sous le T2Not (${fmt(R.Tlim, 0)} Nm, soit ${fmt(R.Tlim / t2not * 100, 0)} %), mais la marge avant ce couple est faible : vérifier la fiche du réducteur.`]);
  if (r && !r._virt && r.jGear == null) C.push(integ ? ['info', 'J_Gear non fourni par le fabricant (réducteur intégré au tambour) : compté à 0. Si l’inertie réelle est connue, la saisir dans la fiche réducteur.', 'app'] : ['warn', 'J_Gear du réducteur non renseigné : compté à 0 dans l’inertie totale. À saisir dans la fiche réducteur.', 'app']);
  if (m.typeMot === 'async' && !R.atv) C.push(['crit', 'Moteur asynchrone : UserCurrentLimit, arrêt et gains sont calculés pour un moteur synchrone sur variateur servo (LXM 62). Résultats non applicables à un asynchrone.']);
  if (R.atv) {
    const pp = num(m.paires) ?? (/^BMP/i.test(refKey(m.ref)) ? 5 : (R.async && num(m.nNom) ? Math.max(1, Math.round(60 * (num(m.freq) ?? 50) / num(m.nNom))) : null));
    /* synchrone : f = n × p ÷ 60 ; asynchrone : f = FRS × n ÷ nN (le glissement nominal est conservé) */
    const fNomA = R.async ? (num(m.freq) ?? 50) : null;
    const rpmOf = v => v != null && feed ? v / feed * i * 60 : null, hzOf = n => n == null ? null : R.async ? (num(m.nNom) ? fNomA * n / num(m.nNom) : null) : (pp ? n * pp / 60 : null);
    const nAtVmax = rpmOf(vMax), nAtVmin = rpmOf(num(a.vMin));
    const ithPct = num(a.ithPct) ?? 100;
    Object.assign(R, { pp, nAtVmax, nAtVmin, fNom: hzOf(num(m.nNom)), fMax: hzOf(num(m.nMax)), hsp: hzOf(nAtVmax), lsp: num(a.vMin) ? hzOf(nAtVmin) : 0, ithPct, ith: R.i0 != null ? R.i0 * ithPct / 100 : null });
    if (!pp && !R.async) C.push(['warn', 'Paires de pôles du moteur non renseignées (fiche moteur) : LSP et HSP en Hz ne peuvent pas être calculés.']);
    if (R.async && !num(m.nNom)) C.push(['warn', 'Vitesse nominale du moteur non renseignée (fiche moteur) : LSP et HSP en Hz ne peuvent pas être calculés.']);
    if (R.async) C.push(['info', 'Moteur asynchrone sur ATV320 : HSP / LSP d’après FRS × n ÷ nN (glissement nominal conservé), couple limité en % de MN (TLIM), courant max = 150 % de IN (surcharge variateur) borné par l’Imax de l’ATV320.' + (R.hsp != null && fNomA && R.hsp > fNomA ? ' HSP au-dessus de FRS (' + fmt(fNomA, 0) + ' Hz) : défluxage, couple disponible réduit.' : ''), 'app']);
    if (R.sansRed) C.push(['info', 'Pas de réducteur sur cet axe : rapport 1 (entraînement direct), limite de courant d’après le moteur et l’ATV320 seulement.', 'app']);
    if (a.variateur && !drv) C.push(['warn', `Variateur « ${a.variateur} » absent du catalogue Variateurs : Imax pris sur le moteur seul. Ajoute la fiche ATV320 (In, Imax) dans Catalogue › Variateurs.`]);
    if (!a.variateur) C.push(['info', 'Pas de référence de variateur sur cet axe : Imax pris sur le moteur seul. Renseigne l’ATV320 dans « Variateur dans Machine Expert ».']);
    if (drv && R.iDrvNom != null && R.i0 && R.iDrvNom < R.i0) C.push(['crit', `L’ATV320 ${drv.ref} (In ${fmt(R.iDrvNom, 1)} A) est plus petit que le courant nominal du moteur (IN ${fmt(R.i0, 2)} A) : variateur sous-dimensionné.`]);
    if (drv && iDrv && imax && iDrv < imax) C.push(['info', `Imax limité par l’ATV320 ${drv.ref} : ${fmt(iDrv, 1)} A (150 % de In ${fmt(R.iDrvNom, 1)} A), le moteur accepterait ${fmt(imax, 1)} A.`]);
    if (R.lsp != null && R.hsp != null && R.lsp > R.hsp) C.push(['warn', `La vitesse basse (${fmt(num(a.vMin), 0)} Units/s) dépasse la vitesse max du cycle : LSP > HSP.`]);
    if (ithPct > 100) C.push(['warn', `ITH réglé à ${fmt(ithPct, 0)} % de IN : au-dessus du courant nominal, la protection thermique du moteur n’est plus assurée.`]);
    if (Iacc != null && Iref && Iacc > Iref) C.push(['crit', `Le courant d’accélération (${fmt(Iacc, 2)} A) dépasse le courant max du moteur avec son ATV320 (${fmt(Iref, 1)} A) : réduire l’accélération, la charge ou prendre un rapport plus grand.`]);
    if (Iacc != null && R.i0 && Iacc > R.i0) C.push(['info', `Courant d’accélération ${fmt(Iacc, 2)} A au-dessus du courant nominal IN (${fmt(R.i0, 2)} A) : admissible en pointe, pas en continu (vérifier le cycle).`]);
    if (vertical && Ihold && R.i0 && Ihold > R.i0) C.push(['warn', `Le maintien de la charge (${fmt(Ihold, 2)} A) dépasse le courant nominal IN du moteur (${fmt(R.i0, 2)} A) : échauffement en continu.`]);
    if (vMax && feed && num(m.nNom) && vMax / feed * i * 60 > num(m.nNom)) C.push(['info', `À ${fmt(vMax, 0)} Units/s le moteur tourne à ${fmt(vMax / feed * i * 60, 0)} tr/min, au-dessus de sa vitesse nominale (${fmt(num(m.nNom), 0)}) : couple disponible réduit.`]);
  }
  if (integ && t2b) C.push(['info', `Réducteur intégré au moteur : rendement (${fmt(eta * 100, 0)} %) compté entre le couple moteur et le couple de sortie. T2B (${fmt(t2b, 1)} Nm) correspond à ${fmt(I_T2B, 2)} A moteur.${stopIntegCut ? ` Au freinage, le rendement ne joue plus en faveur du réducteur : DriveStopCurrentLimit est calculé sans rendement (${fmt(driveStopMa, 0)} mA).` : ''}`]);
  if (!t2b && !R.sansRed) C.push(['warn', 'Le réducteur n’a pas de T2B : la limite de courant n’est pas calculée vis-à-vis du réducteur.']);
  if (I_T2N && vertical && Ihold > I_T2N) C.push(['warn', `Le maintien (${fmt(Ihold)} A) dépasse le couple nominal T2N du réducteur (${fmt(I_T2N)} A).`]);
  if (accMax != null && acc && acc > accMax) C.push(['warn', `L’accélération programmée (${fmt(acc, 0)}) dépasse ce que permet la limite de courant (${fmt(accMax, 0)} Units/s²${vertical ? ' en montée' : ''}).`]);
  if (R.ratioTot != null && R.ratioTot > 30) C.push(['warn', `Rapport d’inertie de ${fmt(R.ratioTot, 0)} (charge ramenée ÷ moteur + réducteur) : très élevé (au-delà de 30, oscillations probables). Prévoir un rapport de réduction plus grand, un moteur plus gros ou une charge plus légère.`]);
  else if (R.ratioTot != null && R.ratioTot > 10) C.push(['warn', `Rapport d’inertie de ${fmt(R.ratioTot, 1)} (charge ramenée ÷ moteur + réducteur) : au-dessus de 10, ${R.atv ? 'soigner les rampes ACC / DEC et vérifier la loi synchrone de l’ATV320' : 'régler les gains par petites étapes et soigner le profil'}.`]);
  if (!R.atv && R.gainFactor && R.gainFactor < 0.7 && num(a.velPRetenu) == null) C.push(['warn', `L’inertie déclarée est multipliée par ${fmt(1 / R.gainFactor, 1)} : baisser Vel_P_Gain AVANT d’augmenter J_Load, sinon le moteur grogne.`]);
  if (decLimited) C.push(['info', 'La décélération d’arrêt est limitée par le courant : l’arrêt dure plus longtemps que la durée visée.']);
  if (vertical && !R.atv) C.push(['info', 'Vérifier BrakeCouplingTime et BrakeDisconnectionTime (F1) : le frein doit tenir avant la coupure du couple.']);
  if (!imax) C.push(['warn', R.atv ? 'Imax du moteur non renseigné : la limite de courant ne peut pas être comparée au moteur. Le saisir dans l’onglet Moteurs.' : 'Imax du moteur non renseigné : UserCurrentLimit (%) ne peut pas être calculé. Le saisir dans l’onglet Moteurs (plaque moteur).']);

  // Attentions acquittées sur cet axe (clé stable : le message sans ses chiffres)
  const acq = (a.acquit && typeof a.acquit === 'object') ? a.acquit : {};
  R.acked = C.filter(c => c[0] === 'warn' && acq[ackKey(c)]).map(c => [c[0], c[1], acq[ackKey(c)], ackKey(c)]);
  if (R.acked.length) R.checks = R.checks.filter(c => !(c[0] === 'warn' && acq[ackKey(c)]));

  // Détail
  const L = R.calc;
  if (R.bielle) { L.push(['Inertie maxi de la charge (bielle-manivelle)', R.bielle.Jmax * 1e4, 'kg·cm²', `angle ${fmt(R.bielle.thMax, 0)}° · course ${fmt(R.bielle.course * 1000, 0)} mm`]); L.push(['Inertie moyenne sur un tour', R.bielle.Jmean * 1e4, 'kg·cm²', 'valeur indicative, le réglage se fait sur le maximum']); }
  L.push(['Kt', kt, 'Nm/A', num(m.kt) ? 'TorqueConstant' : 'M0 ÷ I0']);
  if (feedTheo) L.push(['FeedConstant théorique', feedTheo, 'mm/tr', `π × ${fmt(dRoul, 1)} mm${R.feedSaisi != null ? ' (non utilisé : FeedConstant saisi)' : ''}`]);
  if (lin) L.push(['Rayon équivalent', rmm, 'Units/rad', 'FeedConstant ÷ 2π']);
  L.push(['J charge', JLcharge, 'kg·cm²', lin ? 'masse × rayon² ÷ 100' : R.bielle ? 'maximum de m·r²·f(θ)² sur un tour' : 'saisie']);
  L.push(['J_Load', JL, 'kg·cm²', 'J charge + inertie supplémentaire']);
  L.push(['J charge vue moteur', JLm, 'kg·cm²', 'J_Load ÷ i²']);
  L.push(['TotalInertia', Jtot, 'kg·cm²', 'MotorInertia + J_Gear + J_Load × (1/i)²']);
  if (I_T2B) L.push(['Courant à T2B', I_T2B, 'A', integ ? 'T2B ÷ i ÷ η ÷ Kt (réducteur intégré)' : 'T2B ÷ i ÷ Kt']);
  L.push(['Courant limite', Ilim, 'A', I_T2B ? `${Math.round(marge * 100)} % du courant à T2B` : 'Imax moteur']);
  if (pct != null) L.push(['UserCurrentLimit', pct, '%', `Courant limite ÷ Imax moteur (${fmt(imax, 1)} A) × 100, arrondi en dessous`]);
  if (vertical) L.push(['Courant de maintien', Ihold, 'A', 'm × g × rayon ÷ i ÷ η ÷ Kt']);
  if (kAcc) L.push(['Courant par Unit/s²', kAcc * 1000, 'mA', 'TotalInertia × (2π ÷ Feed) × i ÷ Kt']);
  if (dec) L.push(['ControllerStopDec', dec, 'Units/s²', decLimited ? 'limité par le courant d’arrêt' : 'vMax ÷ durée visée']);
  L.push(['Vel_P_Gain proposé', R.velPSugg, '', `${GAIN_BASE.p} ÷ (1 + rapport charge/moteur ${fmt(rr, 2)})^${GAIN_BASE.expP}, arrondi à 0,5`]);
  L.push(['Vel_I_Gain proposé', R.velISugg, '', `${GAIN_BASE.i} ÷ (1 + rapport charge/moteur ${fmt(rr, 2)})^${GAIN_BASE.expI}, arrondi à 0,1`]);
  return R;
}

/* ---------- Outil « Choix du réducteur » (par axe, optionnel) ---------- */
const TOOLS = { choix: { l: 'Quel réducteur choisir ?', d: 'À partir de la course, de la vitesse et de l’accélération du mouvement : couple, rapport et inertie à viser, comparés au réducteur actuel. Fiche à donner au BE méca.' } };
const TOOL_ORDER = Object.keys(TOOLS);
const GRAV = 9.81;
const toolsOn = d => (d && d.outils && Array.isArray(d.outils.on)) ? d.outils.on.filter(t => TOOLS[t]) : [];
const tv = (d, t, k) => (d && d.outils && d.outils[t]) ? d.outils[t][k] : undefined;
const tn = (d, t, k) => num(tv(d, t, k));
const setTool = (t, k, v) => { const o = S.draft.outils || {}; S.draft.outils = { ...o, [t]: { ...(o[t] || {}), [k]: v } }; };
const tRow = (n, v, u, hl) => `<tr${hl ? ' class="hl"' : ''}><td>${esc(n)}</td><td>${v}</td><td>${esc(u || '')}</td></tr>`;
const tTab = rows => `<table class="reftab ttab"><tbody>${rows.join('')}</tbody></table>`;
const tNote = (lv, m) => `<div class="tnote ${lv}">${esc(m)}</div>`;
const pctTxt = (x, ref) => ref ? fmt(x / ref * 100, 0) + ' %' : '—';
const tIn = (t, k, l, u, d, h) => { const v = tv(d, t, k); return `<div class="field"><label><span${h ? ` class="hint" title="${esc(h)}"` : ''}>${esc(l)}</span></label><div class="inp"><input data-tool="${t}" data-tk="${k}" inputmode="decimal" autocomplete="off" value="${esc(v == null ? '' : String(v).replace('.', ','))}">${u ? `<span class="u">${esc(u)}</span>` : ''}</div></div>`; };
const axIn = (k, l, u, d) => `<div class="field"><label><span>${esc(l)}</span></label><div class="inp"><input data-k="${k}" id="tool-${k}" inputmode="decimal" autocomplete="off" value="${esc(d[k] == null ? '' : String(d[k]).replace('.', ','))}"><span class="u">${esc(u)}</span></div></div>`;
const tSel = (t, k, l, opts, d) => { const v = tv(d, t, k) ?? opts[0][0]; return `<div class="field wide"><label>${esc(l)}</label><select data-tool="${t}" data-tk="${k}">${opts.map(([a, b]) => `<option value="${a}" ${a === v ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select></div>`; };

const STEPS = [
  { k: 's1', t: 'Mouvement', form: d => tSel('choix', 'prof', 'Profil', [['tri', 'Triangulaire (accélère puis freine)'], ['trap', 'Trapèze 1/3 – 1/3 – 1/3'], ['sin', 'Sinusoïdal (accélération en cosinus)']], d) },
  { k: 's2', t: 'Inertie et charge', form: d => {
    const o = tv(d, 'choix', 'orient') || 'vert';
    return tIn('choix', 'tf', 'Couple de frottement', 'Nm', d, 'Côté sortie du réducteur. Vide = 0') + tSel('choix', 'orient', 'Axe de rotation', [['vert', 'Vertical (pivot horizontal)'], ['horiz', 'Horizontal (balourd)']], d) + tIn('choix', 'm', 'Masse excentrée', 'kg', d, 'Sert au balourd (axe horizontal) et aux charges sur l’arbre (axe vertical)') + tIn('choix', 'd', 'Centre de gravité → axe', 'mm', d) + (o === 'vert' ? tIn('choix', 'h', 'Hauteur du centre de gravité', 'mm', d, 'Au-dessus du roulement de sortie du réducteur') : '');
  } },
  { k: 's3', t: 'Couple d’accélération', form: () => '' },
  { k: 's4', t: 'Arrêt d’urgence', form: () => '' },
  { k: 's5', t: 'Cycle (couple efficace)', form: d => tIn('choix', 'nmv', 'Mouvements par cycle', '', d, '2 pour un aller-retour') + tIn('choix', 'tpause', 'Pause par cycle', 's', d) },
  { k: 's6', t: 'Vitesse', form: () => '' },
  { k: 's7', t: 'Charges sur l’arbre de sortie', form: d => tIn('choix', 'fa', 'Charge axiale admissible', 'N', d, 'Catalogue du réducteur') + tIn('choix', 'fr', 'Charge radiale admissible', 'N', d, 'Catalogue du réducteur') + tIn('choix', 'mo', 'Moment admissible', 'Nm', d, 'Catalogue du réducteur') }
];

/* --- Données de base de l'étude --- */
function chMotion(d, R) {
  const o = { ok: false };
  if (!R || R.missing || !R.feed) return o;
  const rad = u => u * 2 * Math.PI / R.feed;
  const th = tn(d, 'choix', 'course'), t = tn(d, 'choix', 'tmove'), prof = tv(d, 'choix', 'prof') || 'tri';
  let prop = null;
  if (th && t) {
    if (prof === 'tri') prop = { v: 2 * th / t, a: 4 * th / (t * t) };
    else if (prof === 'trap') prop = { v: 1.5 * th / t, a: 4.5 * th / (t * t) };
    else prop = { v: 2 * th / t, a: 2 * Math.PI * th / (t * t) };
  }
  const dv = num(d.vMax), da = num(d.acc);
  let v = null, a = null, from = 'axe';
  if (dv && da) { v = dv; a = da; } else if (prop) { v = prop.v; a = prop.a; from = 'mouvement'; }
  if (v == null || a == null) return o;
  Object.assign(o, { ok: true, v, a, from, th, prop, prof: 'acc', omega: rad(v), alpha: rad(a), rpmOut: v / R.feed * 60, rad, vAxe: dv, aAxe: da });
  if (th) { const vpk = Math.min(v, Math.sqrt(th * a)), ta = vpk / a, tc = Math.max(0, th / vpk - ta); Object.assign(o, { vpk, ta, tc, t: 2 * ta + tc, omega: rad(vpk), omegaMax: rad(v) }); }
  return o;
}
function chExtras(d, R) {
  const tf = tn(d, 'choix', 'tf') ?? 0, orient = tv(d, 'choix', 'orient') || 'vert', m = tn(d, 'choix', 'm'), dd = (tn(d, 'choix', 'd') ?? 0) / 1000, h = (tn(d, 'choix', 'h') ?? 0) / 1000;
  const Tbal = orient === 'horiz' && m ? m * GRAV * dd : 0, Th = R.vertical && R.Ihold ? R.Ihold * R.kt * R.i * R.eta : 0;
  return { tf, orient, m, dd, h, Tbal, Th, c: tf + Tbal + Th, cp: Tbal + Th };
}
// intégrale du couple² sur un mouvement
function chMoveI(prof, t, Jal, c, M) {
  if (M && M.ta != null) return (Jal + c) ** 2 * M.ta + c * c * M.tc + (Jal - c) ** 2 * M.ta;
  if (prof === 'sin') return t * (Jal * Jal / 2 + c * c);
  const ta = prof === 'trap' ? t / 3 : t / 2, tc = prof === 'trap' ? t / 3 : 0;
  return (Jal + c) ** 2 * ta + c * c * tc + (Jal - c) ** 2 * ta;
}
function chEval(d, R, M, E, x) {
  const i = num(x.ratio), jg = num(x.jGear) ?? 0, t2b = num(x.t2b), t2n = num(x.t2n), t2not = num(x.t2not), nMax = num(R.m.nMax);
  const Jout = (R.JL + (R.Jm + jg) * i * i) * 1e-4;
  const Tacc = Jout * M.alpha + E.c, Tstop = Jout * M.omega / R.tStop, tstopReal = t2b ? Jout * M.omega / (R.marge * t2b) : null;
  let rms = null;
  if (M.th && M.t) { const n = Math.max(1, tn(d, 'choix', 'nmv') ?? 1), tp = tn(d, 'choix', 'tpause') ?? 0; rms = Math.sqrt((n * chMoveI(M.prof, M.t, Jout * M.alpha, E.c, M) + E.cp * E.cp * tp) / (n * M.t + tp)); }
  const rpm = M.rpmOut * i;
  return { x, i, jg, Jout, Tacc, Tstop, tstopReal, rms, rpm, rr: (R.JL / (i * i)) / (R.Jm + jg), t2b, t2n, t2not, nMax,
    okAcc: t2b ? Tacc <= t2b * R.marge : null,
    okNot: (t2b && t2not) ? t2not >= R.marge * t2b : null,
    okStop: tstopReal != null ? tstopReal <= R.tStop * 1.25 : null,
    okN: (t2n && rms != null) ? rms <= t2n : null,
    okV: nMax ? rpm <= nMax : null,
    okI: ((R.JL / (i * i)) / (R.Jm + jg)) <= 30 };
}
const mark = v => v == null ? '<span class="mk unk" title="donnée manquante">?</span>' : v ? '<span class="mk ok">✓</span>' : '<span class="mk ko">✗</span>';

function fnChoix(d, R) {
  const out = { steps: {}, checks: [], simple: '' }, S_ = (k, st, html) => { out.steps[k] = { st, html }; };
  const M = chMotion(d, R);
  if (!R || R.missing || !R.feed) { S_('s1', 'none', ''); out.simple = `<div class="tmsg">Choisis d’abord un moteur et un réducteur.</div>`; return out; }
  const E = chExtras(d, R), push = (lv, m) => out.checks.push([lv, m]);
  // 1 Mouvement
  if (!M.ok) { S_('s1', 'none', ''); out.simple = `<div class="tmsg">Saisis la course et la durée du mouvement.</div>`; return out; }
  const rows1 = [tRow('Vitesse max de l’axe', fmt(M.v, 0), 'Units/s', 1), tRow('Accélération de l’axe', fmt(M.a, 0), 'Units/s²', 1)];
  if (M.t) rows1.push(tRow('Vitesse atteinte', fmt(M.vpk, 0), 'Units/s'), tRow('Durée du mouvement', fmt(M.t, 2), 's', 1));
  rows1.push(tRow('Vitesse moteur de pointe', fmt(M.rpmOut * R.i, 0), 'tr/min'));
  let h1 = tTab(rows1);
  S_('s1', 'ok', h1);
  // 2 Inertie
  const Jred = (R.Jm + R.Jg) * R.i * R.i, Jout = (R.JL + Jred) * 1e-4;
  const rr = R.ratioTot, st2 = rr == null ? 'none' : rr > 30 ? 'crit' : rr > 10 ? 'warn' : 'ok';
  const rows2 = [tRow('Inertie de la charge', fmt(R.JL, 0), 'kg·cm²'), tRow('Moteur + réducteur ramenés en sortie', fmt(Jred, 0), 'kg·cm²'), tRow('Inertie totale en sortie', fmt(Jout, 3), 'kg·m²', 1), tRow('Rapport d’inertie (charge ramenée ÷ moteur + réducteur)', rr != null ? fmt(rr, rr < 10 ? 1 : 0) : '—', '')];
  if (E.Tbal) rows2.push(tRow('Couple de balourd maxi (m·g·d)', fmt(E.Tbal, 1), 'Nm'));
  if (E.Th) rows2.push(tRow('Couple de maintien', fmt(E.Th, 1), 'Nm'));
  S_('s2', st2, tTab(rows2) + (st2 === 'crit' ? tNote('crit', 'Rapport très élevé : oscillations probables. Un rapport de réduction plus grand ou un moteur plus gros le fait baisser.') : st2 === 'warn' ? tNote('warn', 'Au-dessus de 10 : régler les gains par petites étapes et soigner le profil.') : ''));
  if (st2 === 'crit' || st2 === 'warn') push(st2, `Rapport d’inertie de ${fmt(rr, rr < 10 ? 1 : 0)}${st2 === 'crit' ? ' : très élevé' : ' : au-dessus de 10'}.`);
  // 3 Accélération
  const Tj = Jout * M.alpha, Tacc = Tj + E.c, T2Bmin = Tacc / R.marge;
  const rows3 = [tRow('J × α (inertie)', fmt(Tj, 1), 'Nm')];
  if (E.tf) rows3.push(tRow('Frottements', fmt(E.tf, 1), 'Nm'));
  if (E.Tbal) rows3.push(tRow('Balourd', fmt(E.Tbal, 1), 'Nm'));
  if (E.Th) rows3.push(tRow('Maintien', fmt(E.Th, 1), 'Nm'));
  rows3.push(tRow('Couple de pointe en accélération', fmt(Tacc, 1), 'Nm', 1), tRow(`T2B mini (marge ${fmt(R.marge * 100, 0)} %)`, fmt(T2Bmin, 1), 'Nm', 1));
  let st3 = 'none', n3 = '';
  if (R.t2b) { st3 = Tacc > R.t2b ? 'crit' : Tacc > R.t2b * R.marge ? 'warn' : 'ok'; rows3.push(tRow('Réducteur actuel', pctTxt(Tacc, R.t2b), `du T2B (${fmt(R.t2b, 0)} Nm)`));
    if (st3 !== 'ok') { n3 = tNote(st3, `Le réducteur actuel (T2B ${fmt(R.t2b, 0)} Nm) ${st3 === 'crit' ? 'ne tient pas' : 'n’a pas la marge pour'} ce couple.`); push(st3, `Couple d’accélération de ${fmt(Tacc, 0)} Nm pour un T2B de ${fmt(R.t2b, 0)} Nm.`); } }
  S_('s3', st3, tTab(rows3) + n3);
  // 4 Arrêt d'urgence
  const Tstop = Jout * M.omega / R.tStop, tReal = R.t2b ? Jout * M.omega / (R.marge * R.t2b) : null;
  const rows4 = [tRow(`Couple pour s’arrêter en ${fmt(R.tStop, 2)} s`, fmt(Tstop, 1), 'Nm', 1), tRow('T2B mini pour tenir cet arrêt', fmt(Tstop / R.marge, 1), 'Nm')];
  let st4 = 'none', n4 = '';
  if (tReal != null) { rows4.push(tRow('Arrêt réel avec le courant limité', fmt(tReal, 2), 's')); st4 = tReal > R.tStop * 1.25 ? 'warn' : 'ok';
    if (st4 === 'warn') { n4 = tNote('warn', `Le courant d’arrêt est limité à ${fmt(R.marge * R.t2b, 0)} Nm : l’arrêt réel dure ${fmt(tReal, 2)} s au lieu de ${fmt(R.tStop, 2)} s.`); push('warn', `Arrêt d’urgence : ${fmt(tReal, 2)} s réels contre ${fmt(R.tStop, 2)} s visés (courant limité).`); } }
  if (R.t2not && R.t2b && R.t2not < R.marge * R.t2b) { n4 += tNote('crit', `T2Not (${fmt(R.t2not, 0)} Nm) sous la limite réglée (${fmt(R.marge * R.t2b, 0)} Nm).`); st4 = 'crit'; push('crit', 'T2Not sous la limite de courant réglée.'); }
  S_('s4', st4, tTab(rows4) + n4);
  // 5 Cycle
  let st5 = 'none', h5 = '<div class="tmsg">Il faut la course et la durée du mouvement (étape 1) pour calculer le couple efficace.</div>';
  const cur = chEval(d, R, M, E, R.r);
  if (cur.rms != null) {
    const Irms = cur.rms / R.i / (R.eta || 1) / R.kt, // couple de sortie → courant moteur : le moteur fournit aussi les pertes du réducteur
    n = Math.max(1, tn(d, 'choix', 'nmv') ?? 1), tp = tn(d, 'choix', 'tpause') ?? 0, tot = n * M.t + tp;
    const rows5 = [tRow('Durée du cycle', fmt(tot, 2), 's'), tRow('Cadence', fmt(3600 / tot, 0), 'cycles/h'), tRow('Couple efficace en sortie', fmt(cur.rms, 1), 'Nm', 1), tRow('T2N mini', fmt(cur.rms, 1), 'Nm', 1), tRow('Courant efficace moteur', fmt(Irms, 2), 'A')];
    let n5 = '';
    st5 = 'ok';
    if (R.t2n) { rows5.push(tRow('Réducteur actuel', pctTxt(cur.rms, R.t2n), `du T2N (${fmt(R.t2n, 0)} Nm)`)); if (cur.rms > R.t2n) { st5 = 'crit'; n5 += tNote('crit', `Le couple efficace dépasse le T2N : usure accélérée.`); push('crit', `Couple efficace de ${fmt(cur.rms, 0)} Nm au-dessus du T2N (${fmt(R.t2n, 0)} Nm).`); } else if (cur.rms > R.t2n * 0.8) { st5 = 'warn'; n5 += tNote('warn', `À ${fmt(cur.rms / R.t2n * 100, 0)} % du T2N : peu de marge.`); push('warn', `Couple efficace à ${fmt(cur.rms / R.t2n * 100, 0)} % du T2N.`); } }
    else n5 += tNote('info', 'T2N non renseigné dans la fiche du réducteur.');
    if (R.i0) { rows5.push(tRow('Moteur', pctTxt(Irms, R.i0), `de I0 (${fmt(R.i0, 1)} A)`)); if (Irms > R.i0) { st5 = 'crit'; n5 += tNote('crit', 'Le courant efficace dépasse I0 : échauffement du moteur.'); push('crit', 'Courant efficace au-dessus de I0 du moteur.'); } else if (Irms > R.i0 * 0.8 && st5 === 'ok') { st5 = 'warn'; n5 += tNote('warn', 'Courant efficace à plus de 80 % de I0.'); } }
    h5 = tTab(rows5) + n5;
  }
  S_('s5', st5, h5);
  // 6 Vitesse
  const nMax = num(R.m.nMax), rpmIn = M.rpmOut * R.i, iMax = nMax && M.rpmOut ? nMax / M.rpmOut : null;
  const rows6 = [tRow('Vitesse de sortie de pointe', fmt(M.rpmOut, 1), 'tr/min'), tRow('Vitesse moteur (rapport actuel)', fmt(rpmIn, 0), 'tr/min', 1)];
  let st6 = 'none', n6 = '';
  if (nMax) { rows6.push(tRow('Vitesse max du moteur', fmt(nMax, 0), 'tr/min'), tRow('Rapport i maxi admissible', fmt(iMax, 1), ':1')); st6 = rpmIn > nMax ? 'crit' : rpmIn > nMax * 0.9 ? 'warn' : 'ok'; if (st6 !== 'ok') { n6 = tNote(st6, 'Vitesse moteur trop proche de son maximum.'); push(st6, `Vitesse moteur de ${fmt(rpmIn, 0)} tr/min pour un maximum de ${fmt(nMax, 0)}.`); } }
  else n6 = tNote('info', 'Vitesse max du moteur non renseignée dans sa fiche.');
  S_('s6', st6, tTab(rows6) + n6);
  // 7 Charges sur l'arbre
  let st7 = 'none', h7 = '<div class="tmsg">Saisis la masse et la distance du centre de gravité (étape 2).</div>';
  if (E.m) {
    const rows7 = [], notes = []; let worst = 'ok';
    const lim = (n, v, adm, unit) => { if (!adm) return; rows7.push(tRow(`${n} en % de l’admissible`, pctTxt(v, adm), `${fmt(adm, 0)} ${unit}`)); const s = v > adm ? 'crit' : v > adm * 0.8 ? 'warn' : 'ok'; if (s !== 'ok') { notes.push(tNote(s, `${n} : ${fmt(v, 0)} ${unit} pour ${fmt(adm, 0)} admissibles.`)); push(s, `${n} : ${fmt(v, 0)} ${unit} pour ${fmt(adm, 0)} admissibles.`); } if (s === 'crit' || (s === 'warn' && worst === 'ok')) worst = s; };
    if (E.orient === 'horiz') { rows7.push(tRow('Couple de balourd maxi', fmt(E.Tbal, 1), 'Nm', 1)); rows7.push(tRow('Balourd + accélération', fmt(E.Tbal + Tj, 1), 'Nm')); if (R.t2not && E.Tbal > R.t2not) { worst = 'crit'; notes.push(tNote('crit', `Le balourd seul dépasse le T2Not (${fmt(R.t2not, 0)} Nm) : risque de rupture.`)); push('crit', 'Balourd au-dessus du T2Not.'); } }
    else {
      const Fa = E.m * GRAV, Mst = Fa * E.dd, Fc = E.m * M.omega * M.omega * E.dd, Ft = E.m * M.alpha * E.dd, Fr = Math.hypot(Fc, Ft), Mtot = Math.hypot(Mst + Fc * E.h, Ft * E.h);
      rows7.push(tRow('Charge axiale (poids)', fmt(Fa, 0), 'N'), tRow('Force centrifuge à vitesse de pointe', fmt(Fc, 0), 'N'), tRow('Force tangentielle à l’accélération', fmt(Ft, 0), 'N'), tRow('Charge radiale maxi', fmt(Fr, 0), 'N', 1), tRow('Moment maxi sur le roulement', fmt(Mtot, 1), 'Nm', 1));
      lim('Charge axiale', Fa, tn(d, 'choix', 'fa'), 'N'); lim('Charge radiale', Fr, tn(d, 'choix', 'fr'), 'N'); lim('Moment', Mtot, tn(d, 'choix', 'mo'), 'Nm');
      if (!E.h) notes.push(tNote('info', 'Saisis la hauteur du centre de gravité (étape 2) : elle multiplie les efforts radiaux.'));
      if (!tn(d, 'choix', 'fa') && !tn(d, 'choix', 'fr') && !tn(d, 'choix', 'mo')) notes.push(tNote('info', 'Saisis les charges admissibles du catalogue pour qu’elles soient comparées.'));
    }
    st7 = worst; h7 = tTab(rows7) + notes.join('');
  }
  S_('s7', st7, h7);
  // Récap des besoins
  const dispo = R.marge * (R.t2b || 0), den = dispo - E.c;
  const aMaxRad = den > 0 ? den / Jout : null, aMaxU = aMaxRad ? aMaxRad * R.feed / (2 * Math.PI) : null;
  const rows0 = [].concat(M.t ? [tRow('Durée du mouvement avec ces réglages', fmt(M.t, 2), 's', 1), tRow('Vitesse atteinte', fmt(M.vpk, 0), 'Units/s')] : [],
    [tRow('Couple max en accélération', fmt(Tacc, 1), 'Nm'),
    tRow('T2B mini (accélération, marge ' + fmt(R.marge * 100, 0) + ' %)', fmt(T2Bmin, 1), 'Nm', 1),
    tRow('T2B mini (arrêt en ' + fmt(R.tStop, 2) + ' s)', fmt(Tstop / R.marge, 1), 'Nm'),
    tRow('T2N mini (couple efficace' + (tn(d, 'choix', 'nmv') || tn(d, 'choix', 'tpause') ? ' du cycle' : ', sans pause') + ')', cur.rms != null ? fmt(cur.rms, 1) : '—', 'Nm', 1),
    tRow('T2Not mini', fmt(Math.max(T2Bmin, Tstop / R.marge) * R.marge, 1), 'Nm'),
    tRow('Vitesse moteur maxi', fmt(rpmIn, 0), 'tr/min (rapport actuel)'),
    tRow('Rapport i maxi (vitesse moteur)', iMax ? fmt(iMax, 1) : '—', ':1'),
    tRow('Inertie de la charge ramenée en sortie', fmt(Jout, 3), 'kg·m²'),
    tRow('Rapport d’inertie visé', '≤ 10 (30 maxi)', '')]);
  if (E.orient === 'horiz' && E.Tbal) rows0.push(tRow('Couple de balourd', fmt(E.Tbal, 1), 'Nm'));
  if (E.orient === 'vert' && E.m) rows0.push(tRow('Moment sur le roulement de sortie', fmt(Math.hypot(E.m * GRAV * E.dd + E.m * M.omega * M.omega * E.dd * E.h, E.m * M.alpha * E.dd * E.h), 1), 'Nm'));
  let h0 = tTab(rows0);
  if (M.prop && (!M.vAxe || !M.aAxe || Math.abs(M.vAxe - M.prop.v) > 0.5 || Math.abs(M.aAxe - M.prop.a) > 0.5)) h0 += `<div class="tact"><button type="button" class="btn" data-toolact="apply-mv">Régler vMax ${fmt(Math.ceil(M.prop.v), 0)} et accélération ${fmt(Math.round(M.prop.a), 0)} (pour ${fmt(tn(d, 'choix', 'tmove'), 2)} s)</button></div>`;
  if (R.t2b) {
    if (Tacc <= dispo) h0 += `<div class="verdict ok">✓ Réducteur actuel : ${fmt(Tacc, 1)} Nm demandés pour ${fmt(dispo, 1)} Nm autorisés en accélération.</div>`;
    else h0 += `<div class="verdict ko">✗ Réducteur actuel : ${fmt(Tacc, 1)} Nm demandés pour ${fmt(dispo, 1)} Nm autorisés en accélération.</div>` + (aMaxU ? tNote('info', `Ce réducteur tient jusqu’à ${fmt(Math.floor(aMaxU), 0)} Units/s² d’accélération.`) : '');
  }
  h0 += `<div class="tact"><button type="button" class="btn" data-toolact="fiche-copy">Copier la fiche pour le BE méca</button><button type="button" class="btn" data-toolact="fiche-dl">Télécharger la fiche (.txt)</button></div>`;
  out.simple = h0;
  // Fiche texte pour le bureau d'études
  const L = [], sec = t => { L.push('', t.toUpperCase()); }, ln = (n, v, u) => { if (v != null && v !== '—' && v !== '') L.push('  ' + n + ' : ' + v + (u ? ' ' + u : '')); };
  const pj = (S.projects.find(x => x.id === S.projId) || {}).nom;
  L.push('FICHE DE BESOIN RÉDUCTEUR' + (d.nom ? ' – axe ' + d.nom : ''));
  if (pj) L.push('Projet : ' + pj);
  L.push('Date : ' + new Date().toLocaleDateString('fr-FR'));
  sec('Motorisation'); ln('Moteur', R.m.ref); ln('Courant max (Imax)', R.Iref ? fmt(R.Iref, 1) : null, 'A'); ln('Kt', fmt(R.kt, 3), 'Nm/A'); ln('Vitesse max moteur', R.m.nMax ? fmt(num(R.m.nMax), 0) : null, 'tr/min'); ln('Inertie moteur', fmt(R.Jm, 3), 'kg·cm²');
  sec('Charge'); ln('Inertie de la charge', fmt(R.JL * 1e-4, 3), 'kg·m²'); ln('Masse excentrée', E.m ? fmt(E.m, 1) : null, 'kg'); ln('Centre de gravité à l’axe', E.m ? fmt(E.dd * 1000, 0) : null, 'mm'); ln('Hauteur du centre de gravité', E.h ? fmt(E.h * 1000, 0) : null, 'mm'); ln('Axe de rotation', E.m ? (E.orient === 'horiz' ? 'horizontal' : 'vertical') : null); ln('Frottement', E.tf ? fmt(E.tf, 1) : null, 'Nm');
  sec('Mouvement'); ln('Course', M.th ? fmt(M.th, 0) : null, 'Units'); ln('Vitesse max', fmt(M.v, 0), 'Units/s'); ln('Accélération', fmt(M.a, 0), 'Units/s²'); ln('Durée du mouvement', M.t ? fmt(M.t, 2) : null, 's'); ln('Vitesse max sortie réducteur', fmt(M.rpmOut, 1), 'tr/min'); ln('Arrêt d’urgence visé', fmt(R.tStop, 2), 's'); ln('Mouvements par cycle', tn(d, 'choix', 'nmv'), ''); ln('Pause par cycle', tn(d, 'choix', 'tpause'), 's');
  sec('Caractéristiques à demander au réducteur');
  if (cur.rms != null) L.push('  T2N = ' + fmt(cur.rms, 1) + ' Nm'); L.push('  T2B = ' + fmt(T2Bmin, 1) + ' Nm'); L.push('  T2Not = ' + fmt(Math.max(T2Bmin, Tstop / R.marge) * R.marge, 1) + ' Nm');
  if (E.orient === 'vert' && E.m) { const Fa = E.m * GRAV, Fc = E.m * M.omega * M.omega * E.dd, Ft = E.m * M.alpha * E.dd; ln('Charge axiale sur l’arbre de sortie', fmt(Fa, 0), 'N'); ln('Charge radiale maxi sur l’arbre de sortie', fmt(Math.hypot(Fc, Ft), 0), 'N'); ln('Moment maxi sur le roulement de sortie', fmt(Math.hypot(Fa * E.dd + Fc * E.h, Ft * E.h), 1), 'Nm'); }
  if (E.orient === 'horiz' && E.Tbal) ln('Couple de balourd', fmt(E.Tbal, 1), 'Nm');
  if (R.r && R.r.ref) { sec('Réducteur actuel'); ln('Référence', R.r.ref); ln('Rapport', fmt(R.i, 2), ':1'); ln('T2B', R.t2b ? fmt(R.t2b, 0) : null, 'Nm'); ln('T2N', R.t2n ? fmt(R.t2n, 0) : null, 'Nm'); ln('T2Not', R.t2not ? fmt(R.t2not, 0) : null, 'Nm'); ln('Inertie J_Gear', fmt(R.Jg, 3), 'kg·cm²'); }
  out.fiche = L.join('\n');
  return out;
}

function computeTools(d, R) {
  const out = {};
  toolsOn(d).forEach(t => { try { out[t] = fnChoix(d, R); } catch (e) { out[t] = { steps: { s1: { st: 'none', html: `<div class="tmsg">Calcul impossible (${esc(e.message)}).</div>` } }, checks: [] }; } });
  return out;
}
const toolAlerts = (d, T) => toolsOn(d).flatMap(t => ((T[t] && T[t].checks) || []).map(c => [c[0], `[${TOOLS[t].l}] ${c[1]}`, 'tool']));
const BADGE = { ok: ['ok', 'OK'], warn: ['warn', 'Attention'], crit: ['crit', 'Danger'], none: ['none', ''] };
function renderToolResults(T) {
  toolsOn(S.draft).forEach(t => { const r = T[t]; if (!r) return; document.querySelectorAll('[data-k="vMax"],[data-k="acc"]').forEach(el => { if (el !== document.activeElement) { const v = S.draft[el.dataset.k]; el.value = v == null ? '' : String(v).replace('.', ','); } }); const sm = document.getElementById('sres-simple'); if (sm && sm._h !== (r.simple || '')) { sm._h = r.simple || ''; sm.innerHTML = sm._h; } STEPS.forEach(s => { const o = r.steps[s.k], el = document.getElementById('sres-' + s.k), b = document.getElementById('sb-' + s.k); if (el) { const h = o ? o.html : ''; if (el._h !== h) { el._h = h; el.innerHTML = h; } } if (b) { const [c, l] = BADGE[(o && o.st) || 'none']; b.className = 'sbadge ' + c; b.textContent = l; } }); });
}
function toolsBox(d) {
  const on = toolsOn(d), open = S.toolOpen || {};
  const panels = on.map(t => `<details class="tool" data-tbox="${t}" ${open[t] === false ? '' : 'open'}><summary><span class="tt">${esc(TOOLS[t].l)}</span><button type="button" class="tx" data-rmtool="${t}" title="Retirer l’outil (ta saisie est gardée)" aria-label="Retirer ${esc(TOOLS[t].l)}">✕</button></summary><div class="tbody"><div class="simple"><div class="sform">${tIn('choix', 'course', 'Course', 'Units', d, 'Ex. 90 pour un pivot de 0 à 90°')}${tIn('choix', 'tmove', 'Durée visée (pour proposer vMax et accélération)', 's', d, 'Aller seul, de l’arrêt à l’arrêt. Optionnel')}${axIn('vMax', 'Vitesse max (vMax)', 'Units/s', d)}${axIn('acc', 'Accélération', 'Units/s²', d)}</div><div class="sres" id="sres-simple"></div></div><details class="more" data-det ${S.toolDet ? 'open' : ''}><summary>Détail des calculs (7 étapes)</summary><div class="inner">${STEPS.map((s, n) => `<div class="step"><div class="sh"><span class="sn">${n + 1}</span><b>${esc(s.t)}</b><span class="sbadge none" id="sb-${s.k}"></span></div><div class="sform">${s.form(d)}</div><div class="sres" id="sres-${s.k}"></div></div>`).join('')}</div></details></div></details>`).join('');
  const add = TOOL_ORDER.filter(t => !on.includes(t)).map(t => `<div class="addone"><button type="button" class="btn ghost addtool" data-addtool="${t}">+ ${esc(TOOLS[t].l)}</button><span class="el-sub">${esc(TOOLS[t].d)}</span></div>`).join('');
  return `<fieldset class="toolsbox"><legend>Outils</legend>${panels}${add ? `<div class="addrow">${add}</div>` : ''}</fieldset>`;
}
function bindTools(form) {
  const dirty = () => { S.dirty = true; S.justSaved = false; updateDirty(); };
  form.addEventListener('input', e => { const el = e.target; if (el.dataset.tool && el.tagName !== 'SELECT') { setTool(el.dataset.tool, el.dataset.tk, num(el.value)); dirty(); renderResults(); } });
  form.addEventListener('change', e => { const el = e.target; if (el.dataset.tool && el.tagName === 'SELECT') { setTool(el.dataset.tool, el.dataset.tk, el.value); dirty(); renderAxes(); } });
  form.addEventListener('click', e => {
    const b = e.target.closest('[data-addtool],[data-rmtool],[data-toolact],[data-pick]'); if (!b) return;
    const o = S.draft.outils || {};
    if (b.dataset.addtool) { S.draft.outils = { ...o, on: [...toolsOn(S.draft), b.dataset.addtool] }; S.toolOpen = { ...(S.toolOpen || {}), [b.dataset.addtool]: true }; dirty(); renderAxes(); }
    else if (b.dataset.rmtool) { e.preventDefault(); S.draft.outils = { ...o, on: toolsOn(S.draft).filter(t => t !== b.dataset.rmtool) }; dirty(); renderAxes(); }
    else if (b.dataset.pick) { S.draft.reducteurId = b.dataset.pick; dirty(); renderAxes(); }
    else if (b.dataset.toolact === 'fiche-copy' || b.dataset.toolact === 'fiche-dl') {
      const T = computeTools(S.draft, compute(S.draft)), txt = T.choix && T.choix.fiche; if (!txt) { setStatus('Fiche indisponible : renseigne le mouvement.', true); return; }
      if (b.dataset.toolact === 'fiche-copy') { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { b.textContent = 'Fiche copiée'; setTimeout(() => { b.textContent = 'Copier la fiche pour le BE méca'; }, 1500); }).catch(() => { b.textContent = 'Copie refusée'; }); }
      else { const name = 'Fiche_reducteur_' + String(S.draft.nom || 'axe').replace(/[^\w\-]+/g, '_') + '.txt', bytes = new TextEncoder().encode(txt);
        if (S.dl) S.dl.save({ filename: name, data: bytes }).then(() => setStatus('Fiche enregistrée : ' + name)).catch(e => { if (!(e && e.code === 'declined')) setStatus('Export impossible.', true); });
        else { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'text/plain;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); } }
    }
    else if (b.dataset.toolact === 'apply-mv') { const M = chMotion(S.draft, compute(S.draft)); if (M.ok && M.prop) { S.draft.vMax = Math.ceil(M.prop.v); S.draft.acc = Math.round(M.prop.a); dirty(); renderAxes(); } }
  });
  form.querySelectorAll('details[data-det]').forEach(dt => { dt.ontoggle = () => { S.toolDet = dt.open; }; });
  form.querySelectorAll('details.tool').forEach(dt => { dt.ontoggle = () => { S.toolOpen = { ...(S.toolOpen || {}), [dt.dataset.tbox]: dt.open }; }; });
}

/* Convertisseur d'unité pour les inerties : saisie en kg·m² */
document.addEventListener('click', e => {
  const b = e.target.closest('.convbtn'); if (!b) return;
  const box = b.parentElement.querySelector('.convbox'); box.hidden = !box.hidden; if (!box.hidden) box.querySelector('input').focus();
});
document.addEventListener('change', e => {
  const i = e.target.closest && e.target.closest('.convin'); if (!i) return;
  const v = num(i.value), tgt = document.getElementById(i.dataset.for);
  if (v != null && tgt) { tgt.value = String(+(v * 1e4).toPrecision(6)).replace('.', ','); tgt.dispatchEvent(new Event('input', { bubbles: true })); tgt.dispatchEvent(new Event('change', { bubbles: true })); }
  i.value = ''; const box = i.closest('.convbox'); if (box) box.hidden = true;
});

/* ---------- Base de données ---------- */
function setStatus(t, err) { const s = $('#status'); s.textContent = t || ''; s.classList.toggle('err', !!err); s.hidden = !t; }
const pAxes = () => S.axes.filter(a => a.projetId === S.projId);
const curProj = () => S.projects.find(p => p.id === S.projId);
const projName = id => S.projects.find(p => p.id === id)?.nom || '';
function allLoaded() { return KEYS.every(k => S.loaded[k]); }
const LOCAL_KEY = 'reglages-servo-base';
function saveLocal() {
  const w = $('#localWarn');
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...Object.fromEntries(KEYS.map(k => [k, S[k].filter(x => !x._cat)])), _seedVersion: S.seedVersion || null, _seedHashes: S.seedHashes || null })); if (w) w.textContent = ''; }
  catch (e) { if (w) w.textContent = 'Le navigateur bloque l’enregistrement : exporte la base avant de fermer.'; }
}
const CATK = ['motors', 'reducers', 'drives', 'hwtypes', 'iodict'];
const itemHash = o => { const s = JSON.stringify(o, Object.keys(o).filter(k => k !== '_cat').sort()); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; };
function seedHashesOf(seed) { const m = {}; CATK.forEach(k => (seed[k] || []).forEach(x => { if (x && x.id) m[k + '/' + x.id] = itemHash(x); })); return m; }
function syncSeed(seed, manual) {
  let added = 0, updated = 0, kept = 0; const old = S.seedHashes, nh = seedHashesOf(seed);
  CATK.forEach(k => { (seed[k] || []).forEach(x => {
    if (!x || !x.id) return;
    const ix = S[k].findIndex(y => y.id === x.id);
    if (ix < 0) { S[k].push(x); added++; return; }
    const loc = S[k][ix];
    if (itemHash(loc) === nh[k + '/' + x.id]) return;
    if (!old || old[k + '/' + x.id] === itemHash(loc)) { S[k][ix] = x; updated++; } else kept++;
  }); });
  S.seedHashes = nh; S.seedVersion = seed._version || S.seedVersion; saveLocal();
  const parts = []; if (added) parts.push(added + ' référence' + (added > 1 ? 's' : '') + ' ajoutée' + (added > 1 ? 's' : '')); if (updated) parts.push(updated + ' mise' + (updated > 1 ? 's' : '') + ' à jour'); if (kept) parts.push(kept + ' fiche' + (kept > 1 ? 's' : '') + ' modifiée' + (kept > 1 ? 's' : '') + ' par toi conservée' + (kept > 1 ? 's' : ''));
  setTimeout(() => { setStatus(parts.length ? 'Catalogue : ' + parts.join(', ') + '.' : (manual ? 'Catalogue déjà à jour.' : '')); if (S.seedInfo) S.seedInfo(); }, 0);
}
function loadBase(o) { KEYS.forEach(k => { S[k] = Array.isArray(o?.[k]) ? o[k].filter(x => x && x.id) : []; S.loaded[k] = true; }); }
async function writeDoc(key, id, data) {
  if (data && data._cat) { data = { ...data }; delete data._cat; }
  if (S.db) { await S.db.collection(COLL[key]).doc(id).set(data); }
  else { const arr = S[key]; const ix = arr.findIndex(x => x.id === id); const doc = { id, ...data }; if (ix >= 0) arr[ix] = doc; else arr.push(doc); saveLocal(); onData(); }
}
async function deleteDoc(key, id) {
  if (S.db) await S.db.collection(COLL[key]).doc(id).delete();
  else { S[key] = S[key].filter(x => x.id !== id); saveLocal(); onData(); }
}
function newId(key) { try { if (S.db) return S.db.collection(COLL[key]).doc().id; } catch (e) {} return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function strip(o) { const c = { ...o }; delete c.id; return c; }

function onData() {
  KEYS.forEach(k => { const el = $('#cnt-' + k); if (el) el.textContent = S.loaded[k] ? S[k].length : ''; });
  S.axes.sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr', { numeric: true }));
  const bySerie = (a, b) => String(a.serie || '~').localeCompare(String(b.serie || '~'), 'fr', { numeric: true }) || ((num(a.ratio) ?? 0) - (num(b.ratio) ?? 0)) || String(a.ref).localeCompare(String(b.ref), 'fr', { numeric: true });
  if (S.loaded.reducers) { const have = new Set(S.reducers.filter(x => !x._cat).map(x => x.id)); S.reducers = S.reducers.filter(x => !x._cat).concat(sewCatalog().filter(x => !have.has(x.id))); }
  if (S.loaded.hwtypes) { const have = new Set(S.hwtypes.filter(x => !x._cat).map(x => x.id)); S.hwtypes = S.hwtypes.filter(x => !x._cat).concat(hwBuiltin().filter(x => !have.has(x.id))); S.hwtypes.sort((a, b) => HW_FAMS.indexOf(a.serie) - HW_FAMS.indexOf(b.serie) || String(a.ref).localeCompare(String(b.ref), 'fr', { numeric: true })); }
  if (S.loaded.iodict) { const have = new Set(S.iodict.filter(x => !x._cat).map(x => x.id)); S.iodict = S.iodict.filter(x => !x._cat).concat(ioBuiltin().filter(x => !have.has(x.id))); }
  S.motors.sort(bySerie); S.reducers.sort(bySerie); S.drives.sort((a, b) => String(a.serie || '~').localeCompare(String(b.serie || '~'), 'fr') || ((num(a.puissance) ?? num(a.iPeak) ?? 0) - (num(b.puissance) ?? num(b.iPeak) ?? 0)) || String(a.ref).localeCompare(String(b.ref), 'fr', { numeric: true }));
  if (allLoaded()) { if (!S.db) $('#localbar').hidden = false; if (!S.booted) { S.booted = true; setStatus(''); } }
  if (allLoaded()) migrate();
  S.projects.sort((a, b) => (a.statut === 'termine') - (b.statut === 'termine') || (b.cree || 0) - (a.cree || 0));
  if (!S.projects.find(p => p.id === S.projId)) { let t = null; try { t = localStorage.getItem('servo-proj'); } catch (e) {} S.projId = S.projects.find(p => p.id === t)?.id || S.projects[0]?.id || null; S.axisId = null; S.dirty = false; }
  const PA = pAxes();
  if (!S.axisId || (!PA.find(a => a.id === S.axisId) && !(S.draft && S.draft._new))) { S.axisId = PA[0]?.id || null; S.dirty = false; }
  if (!S.dirty) { const a = PA.find(x => x.id === S.axisId); S.draft = a ? { ...a } : (S.draft && S.draft._new ? S.draft : null); }
  render();
}

/* ---------- Rendu ---------- */
let migrating = false;
async function migrate() {
  if (migrating) return;
  const orphans = S.axes.filter(a => !a.projetId);
  if (!orphans.length && S.projects.length) return;
  migrating = true;
  try {
    let pid = S.projects[0]?.id;
    if (!pid) { pid = 'projet-1'; await writeDoc('projects', pid, { nom: 'Projet 1', statut: 'en cours', cree: Date.now() }); }
    for (const a of orphans) await writeDoc('axes', a.id, { ...strip(a), projetId: pid });
  } catch (e) { setStatus('Migration vers les projets impossible : ' + (e.message || e.code), true); }
}
/* ---------- Export d'un projet en Excel (.xlsx écrit directement, sans bibliothèque) ---------- */
const XL = (() => {
  const enc = new TextEncoder();
  const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const parts = [], central = []; let off = 0;
    for (const f of files) {
      const nm = enc.encode(f.name), d = enc.encode(f.data), crc = crc32(d);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, d.length, true);
      h.setUint32(22, d.length, true); h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), nm, d);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true);
      c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, nm.length, true);
      c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), nm);
      off += 30 + nm.length + d.length;
    }
    const cd = central.reduce((s, p) => s + p.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, cd, true); e.setUint32(16, off, true);
    const all = [...parts, ...central, new Uint8Array(e.buffer)];
    const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0)); let p = 0;
    for (const a of all) { out.set(a, p); p += a.length; }
    return out;
  }
  const x = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const colL = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const ref = (r, c) => colL(c) + (r + 1);
  function Styles() {
    const fonts = ['<font><sz val="10"/><color rgb="FF15202A"/><name val="Calibri"/><family val="2"/></font>'];
    const fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
    const borders = ['<border><left/><right/><top/><bottom/><diagonal/></border>'];
    const fmts = [], xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'], cache = {};
    const BUILTIN = { '0': 1, '0.00': 2, '#,##0': 3, '#,##0.00': 4 };
    const idx = (arr, v) => { let i = arr.indexOf(v); if (i < 0) { arr.push(v); i = arr.length - 1; } return i; };
    return {
      get(o = {}) {
        const k = JSON.stringify(o); if (cache[k] != null) return cache[k];
        const font = `<font>${o.b ? '<b/>' : ''}${o.i ? '<i/>' : ''}<sz val="${o.sz || 10}"/><color rgb="${o.color || 'FF15202A'}"/><name val="Calibri"/><family val="2"/></font>`;
        const fill = o.fill ? `<fill><patternFill patternType="solid"><fgColor rgb="${o.fill}"/><bgColor indexed="64"/></patternFill></fill>` : fills[0];
        const bc = o.bc || 'FFC9D2DB';
        const border = o.border ? `<border><left style="thin"><color rgb="${bc}"/></left><right style="thin"><color rgb="${bc}"/></right><top style="thin"><color rgb="${bc}"/></top><bottom style="thin"><color rgb="${bc}"/></bottom><diagonal/></border>` : borders[0];
        let nf = 0;
        if (o.fmt) { if (BUILTIN[o.fmt] != null) nf = BUILTIN[o.fmt]; else { const j = idx(fmts, o.fmt); nf = 164 + j; } }
        const al = `<alignment horizontal="${o.h || 'general'}" vertical="center"${o.wrap ? ' wrapText="1"' : ''}${o.indent ? ` indent="${o.indent}"` : ''}/>`;
        const xf = `<xf numFmtId="${nf}" fontId="${idx(fonts, font)}" fillId="${idx(fills, fill)}" borderId="${idx(borders, border)}" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${al}</xf>`;
        return (cache[k] = idx(xfs, xf));
      },
      xml() {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
          + (fmts.length ? `<numFmts count="${fmts.length}">${fmts.map((f, i) => `<numFmt numFmtId="${164 + i}" formatCode="${x(f)}"/>`).join('')}</numFmts>` : '')
          + `<fonts count="${fonts.length}">${fonts.join('')}</fonts><fills count="${fills.length}">${fills.join('')}</fills><borders count="${borders.length}">${borders.join('')}</borders>`
          + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
          + `<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
      }
    };
  }
  function Sheet(name) {
    const rows = new Map(), merges = [], heights = {};
    return {
      name, cols: [], freeze: null, landscape: false,
      set(r, c, v, s) { if (typeof v === 'number') v = isFinite(v) ? +v.toPrecision(12) : null; if (!rows.has(r)) rows.set(r, new Map()); rows.get(r).set(c, { v, s }); },
      merge(r1, c1, r2, c2) { merges.push(ref(r1, c1) + ':' + ref(r2, c2)); },
      height(r, h) { heights[r] = h; },
      xml() {
        const rs = [...new Set([...rows.keys(), ...Object.keys(heights).map(Number)])].sort((a, b) => a - b);
        const body = rs.map(r => {
          const cells = rows.has(r) ? [...rows.get(r).entries()].sort((a, b) => a[0] - b[0]).map(([c, { v, s }]) => {
            const a = ` r="${ref(r, c)}"${s ? ` s="${s}"` : ''}`;
            if (v == null || v === '') return `<c${a}/>`;
            if (typeof v === 'number' && isFinite(v)) return `<c${a}><v>${v}</v></c>`;
            return `<c${a} t="inlineStr"><is><t xml:space="preserve">${x(v)}</t></is></c>`;
          }).join('') : '';
          return `<row r="${r + 1}"${heights[r] ? ` ht="${heights[r]}" customHeight="1"` : ''}>${cells}</row>`;
        }).join('');
        const pane = this.freeze ? `<pane${this.freeze.c ? ` xSplit="${this.freeze.c}"` : ''}${this.freeze.r ? ` ySplit="${this.freeze.r}"` : ''} topLeftCell="${ref(this.freeze.r, this.freeze.c)}" activePane="bottomRight" state="frozen"/>` : '';
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
          + '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'
          + `<sheetViews><sheetView workbookViewId="0" zoomScale="100" showGridLines="0">${pane}</sheetView></sheetViews>`
          + '<sheetFormatPr defaultRowHeight="15"/>'
          + (this.cols.length ? `<cols>${this.cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '')
          + `<sheetData>${body}</sheetData>`
          + (merges.length ? `<mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '')
          + '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>'
          + `<pageSetup paperSize="9" orientation="${this.landscape ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/></worksheet>`;
      }
    };
  }
  function book(sheets, styles) {
    const files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        + sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>'
        + sheets.map((s, i) => `<sheet name="${x(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
        + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: 'xl/styles.xml', data: styles.xml() },
      ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s.xml() }))
    ];
    return zip(files);
  }
  return { Styles, Sheet, book, zip };
})();

function gainsOf(a, R) {
  const vpR = num(a.velPRetenu), viR = num(a.velIRetenu);
  return {
    vp: vpR ?? R.velPTransp ?? R.velPSugg, vpSrc: vpR != null ? 'gardé après essais' : (R.velPTransp != null ? 'transposé du réglage actuel' : 'proposé (point de départ)'),
    vi: viR ?? R.velISugg, viSrc: viR != null ? 'gardé après essais' : 'proposé (point de départ)'
  };
}
function torqueRows(a, R) {
  if (!R.t2b) return [];
  const m = R.marge * 100, out = [];
  const add = (l, t) => { const p = t / R.t2b * 100; out.push({ l, t, p, st: p > 100.05 || (R.t2not && t > R.t2not) ? 'crit' : p > m + 0.05 ? 'warn' : 'ok' }); };
  add(`Limite calculée (UserCurrentLimit ${fmt(R.pct, 1)} %)`, R.Tlim);
  if (R.Tucl != null) add(`Réglage actuel du variateur (${fmt(R.ucl, 1)} %)`, R.Tucl);
  if (R.vertical && R.Ihold) add('Maintien de la charge', R.Ihold * R.kt * R.i * R.eta);
  if (R.IstopA) add(`Arrêt d’urgence (${fmt(R.driveStopMa, 0)} mA)`, R.IstopA * R.kt * R.i);
  return out;
}
function buildXlsx() {
  const cur = curProj(), now = new Date();
  const when = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const C = { dark: 'FF1B2632', acc: 'FF1D5A8E', accSoft: 'FFDFEAF5', key: 'FFEEF4FA', grey: 'FFF2F4F7', white: 'FFFFFFFF', muted: 'FF5A6774',
    ok: 'FFE1F1E7', okT: 'FF2C7A4C', warn: 'FFFBEFD9', warnT: 'FF9C5D0E', crit: 'FFFBE3E1', critT: 'FFB3261E' };
  const ST = XL.Styles(), s = o => ST.get(o);
  const sTitle = s({ b: 1, sz: 15, color: C.white, fill: C.dark, indent: 1 }), sSub = s({ i: 1, color: C.muted, indent: 1 });
  const sBand = s({ b: 1, color: C.white, fill: C.acc, border: 1, h: 'center' }), sTh = s({ b: 1, fill: C.accSoft, border: 1, h: 'center', wrap: 1 });
  const sSect = s({ b: 1, sz: 11, color: C.white, fill: C.acc, indent: 1 });
  const sLabel = s({ fill: C.grey, border: 1, indent: 1 }), sTxt = s({ border: 1, indent: 1 }), sTxtB = s({ b: 1, border: 1, indent: 1 }), sUnit = s({ color: C.muted, border: 1, h: 'center' });
  const sNote = s({ i: 1, color: C.muted }), sWrap = s({ border: 1, wrap: 1, indent: 1 });
  const feedDec = v => Number.isInteger(v) ? 'int' : Math.min(3, (String(v).split('.')[1] || '').length);
  const nfOf = d => d === 'int' ? '0' : d === 0 ? '#,##0' : d === 1 ? '#,##0.0' : d === 2 ? '#,##0.00' : '0.000';
  const sNum = (d, key) => s({ border: 1, fmt: nfOf(d), h: 'right', ...(key ? { b: 1, fill: C.key, sz: 11 } : {}) });
  const sStat = (st, d) => s({ b: 1, border: 1, h: d == null ? 'center' : 'right', fill: C[st], color: C[st + 'T'], ...(d != null ? { fmt: nfOf(d) } : {}) });
  const ETAT = { ok: 'OK', warn: 'Attention', crit: 'Danger' };
  const data = pAxes().map(a => { const R = compute(a); const al = R.missing ? [] : R.checks.filter(c => (c[0] === 'crit' || c[0] === 'warn') && c[2] !== 'app');
    return { a, R, g: R.missing ? null : gainsOf(a, R), tr: R.missing ? [] : torqueRows(a, R), al, st: R.missing ? 'warn' : al.some(c => c[0] === 'crit') ? 'crit' : al.length ? 'warn' : 'ok' }; });
  const J = R => Math.round(R.JL / 10) * 10;

  // ----- Onglet Synthèse : une ligne par axe
  const sy = XL.Sheet('Synthèse'); sy.landscape = true;
  sy.cols = [10, 20, 24, 8, 8, 9, 11, 11, 9, 13, 13, 13, 14, 10, 9, 9, 10, 12, 9, 11];
  const lastC = sy.cols.length - 1;
  sy.set(0, 0, `Réglages servo · ${cur?.nom || ''}`, sTitle); for (let c = 1; c <= lastC; c++) sy.set(0, c, '', sTitle); sy.merge(0, 0, 0, lastC); sy.height(0, 26);
  sy.set(1, 0, `Exporté le ${when} · projet ${cur?.statut === 'termine' ? 'terminé' : 'en cours'} · ${data.length} axe${data.length > 1 ? 's' : ''} · une fiche détaillée par axe dans les onglets suivants`, sSub); sy.merge(1, 0, 1, lastC);
  const bands = [['Axe et matériel', 0, 3], ['Mechanic', 4, 8], ['General', 9, 13], ['Control loop', 14, 15], ['Contrôle réducteur', 16, 19]];
  bands.forEach(([t, c1, c2]) => { for (let c = c1; c <= c2; c++) sy.set(3, c, c === c1 ? t : '', sBand); sy.merge(3, c1, 3, c2); });
  const heads = ['Axe', 'Moteur', 'Réducteur', 'i', 'GearIn', 'GearOut', 'Feed\nConstant', 'J_Load\nkg·cm²', 'J_Gear\nkg·cm²', 'UserCurrent\nLimit %', 'DriveStop\nCurrentLimit mA', 'ControllerStop\nDec', 'ControllerStop\nJerk', 'StopTime\nLim ms', 'Vel_P\nGain', 'Vel_I\nGain', 'T2B\nNm', 'Couple autorisé\nNm', '% T2B', 'État'];
  heads.forEach((h, c) => sy.set(4, c, h, sTh)); sy.height(4, 32);
  data.forEach((d, k) => {
    const r = 5 + k, { a, R, g } = d;
    sy.set(r, 0, a.nom || 'Sans nom', sTxtB);
    sy.set(r, 1, R.m?.ref ?? S.motors.find(m => m.id === a.moteurId)?.ref ?? '', sTxt);
    sy.set(r, 2, R.r?.ref ?? S.reducers.find(x => x.id === a.reducteurId)?.ref ?? '', sTxt);
    if (R.missing) { sy.set(r, 3, R.why || 'Ensemble incomplet', sStat('warn')); sy.merge(r, 3, r, lastC); for (let c = 4; c <= lastC; c++) sy.set(r, c, '', sStat('warn')); return; }
    sy.set(r, 3, R.i, sNum(R.i % 1 ? 2 : 0));
    sy.set(r, 4, R.gears ? R.gears.gIn : 1, sNum('int', 1)); sy.set(r, 5, R.gears ? R.gears.gOut : R.i, R.gears && !R.gears.exact ? s({ border: 1, h: 'right', fmt: '0', b: 1, fill: C.warn, color: C.warnT }) : sNum(R.gears ? 'int' : 3, 1));
    sy.set(r, 6, R.feed ?? null, sNum(R.feed ? feedDec(R.feed) : 'int', 1));
    sy.set(r, 7, J(R), sNum(0, 1)); sy.set(r, 8, R.Jg, sNum(3, 1));
    sy.set(r, 9, R.pct, sNum(1, 1)); sy.set(r, 10, R.driveStopMa, sNum(0)); sy.set(r, 11, R.dec, sNum(0)); sy.set(r, 12, R.jerkStop, sNum(0)); sy.set(r, 13, R.stl, sNum(0));
    sy.set(r, 14, g.vp, sNum(1, 1)); sy.set(r, 15, g.vi, sNum(1, 1));
    const lim = d.tr[0];
    sy.set(r, 16, R.t2b, sNum(0)); sy.set(r, 17, lim ? lim.t : null, sNum(0)); sy.set(r, 18, lim ? lim.p / 100 : null, lim ? s({ b: 1, border: 1, h: 'right', fmt: '0%', fill: C[lim.st], color: C[lim.st + 'T'] }) : sTxt);
    sy.set(r, 19, ETAT[d.st], sStat(d.st));
    sy.height(r, 18);
  });
  sy.freeze = { r: 5, c: 1 };
  const sheets = [sy];

  // ----- Une fiche par axe
  const used = new Set(['Synthèse']);
  data.forEach(d => {
    const { a, R, g } = d;
    let nm = String(a.nom || 'Axe').replace(/[\[\]:*?\/\\]/g, '-').slice(0, 28) || 'Axe'; let base = nm, k = 2; while (used.has(nm)) nm = base + ' ' + k++; used.add(nm);
    const ws = XL.Sheet(nm); ws.cols = [38, 24, 12, 42];
    let r = 0;
    const full = (t, st, h) => { for (let c = 0; c < 4; c++) ws.set(r, c, c ? '' : t, st); ws.merge(r, 0, r, 3); if (h) ws.height(r, h); r++; };
    const line = (l, v, u, note, vs) => { ws.set(r, 0, l, sLabel); ws.set(r, 1, v ?? '', vs || (typeof v === 'number' ? sNum(2) : sTxt)); ws.set(r, 2, u || '', sUnit); ws.set(r, 3, note || '', sTxt); r++; };
    const th = cols => { cols.forEach((t, c) => ws.set(r, c, t, sTh)); ws.height(r, 20); r++; };
    full(`Axe ${a.nom || ''}`, sTitle, 26);
    full(`Projet ${cur?.nom || ''} · exporté le ${when} · état : ${ETAT[d.st]}`, sSub);
    r++;
    full('MATÉRIEL', sSect, 20);
    line('Moteur', R.m?.ref ?? S.motors.find(m => m.id === a.moteurId)?.ref ?? '—');
    line('Réducteur', R.r?.ref ?? S.reducers.find(x => x.id === a.reducteurId)?.ref ?? '—');
    if (R.missing) { r++; full(R.why || 'Ensemble incomplet : choisir un moteur et un réducteur.', s({ b: 1, fill: C.warn, color: C.warnT, wrap: 1, indent: 1 }), 22); sheets.push(ws); return; }
    line('Rapport de réduction i', R.i, '', '', sNum(R.i % 1 ? 3 : 0));
    line('Kt moteur (TorqueConstant)', R.kt, 'Nm/A', '', sNum(3));
    line('Imax moteur', R.Iref, 'A', 'Référence du 100 % de UserCurrentLimit', sNum(1));
    line('T2B réducteur (couple max)', R.t2b, 'Nm', 'Couple max admissible utilisé pour la limite', sNum(0, 1));
    if (R.t2n) line('T2N réducteur (couple nominal)', R.t2n, 'Nm', '', sNum(0));
    if (R.t2not) line('T2Not réducteur (arrêt d’urgence)', R.t2not, 'Nm', 'À ne jamais dépasser', sNum(0));
    r++;
    full('CHARGE ET MOUVEMENT', sSect, 20);
    const tcx = a.typeCharge || 'lineaire', lin = tcx === 'lineaire' || tcx === 'convoyeur';
    line('Type de charge', tcx === 'convoyeur' ? 'Convoyeur' : tcx === 'lineaire' ? 'Linéaire' : tcx === 'bielle' ? 'Bielle-manivelle' : 'Rotative');
    if (tcx === 'convoyeur') line('Diamètre du rouleau d’entraînement', num(a.dRouleau), 'mm', R.feedTheo ? 'FeedConstant théorique ' + fmt(R.feedTheo, 3) + ' (π × D)' : '', sNum(1));
    if (lin) line('Masse en mouvement', num(a.masse), 'kg', '', sNum(1)); else if (a.typeCharge === 'bielle') { const BI = bielleCalc(a); line('Inertie maxi de la charge (bielle-manivelle)', BI ? BI.Jmax * 1e4 : null, 'kg·cm²', 'Rayon ' + (num(a.rManiv) ?? '—') + ' mm · plaque ' + (num(a.mPlaque) ?? '—') + ' kg', sNum(1)); } else line('Inertie de la charge', num(a.jLoadDirect), 'kg·cm²', 'Côté sortie du réducteur', sNum(1));
    if (num(a.jSupp)) line('Inertie en plus', num(a.jSupp), 'kg·cm²', 'Poulies, rouleaux… côté sortie', sNum(1));
    if (tcx === 'lineaire') line('Axe vertical', a.vertical ? 'Oui' : 'Non');
    line('Vitesse max du cycle (pas celle du moteur)', num(a.vMax), 'Units/s', 'Vitesse la plus élevée du mouvement programmé', sNum(0));
    line('Durée d’arrêt visée', num(a.tStop) ?? 0.2, 's', '', sNum(2));
    line('Part de T2B autorisée', (num(a.marge) ?? 80) / 100, '', 'Marge sur le couple max du réducteur', s({ border: 1, h: 'right', fmt: '0%' }));
    r++;
    full('À SAISIR DANS LE VARIATEUR', sSect, 20);
    th(['Paramètre', 'Valeur', 'Unité', 'Dossier']);
    const p = (l, v, u, dir, dec, key) => { ws.set(r, 0, l, key ? s({ b: 1, fill: C.key, border: 1, indent: 1 }) : sLabel); ws.set(r, 1, v ?? '', typeof v === 'number' ? sNum(dec, key) : s({ border: 1, h: 'left', indent: 1, ...(key ? { b: 1, fill: C.key } : {}) })); ws.set(r, 2, u || '', sUnit); ws.set(r, 3, dir, sTxt); if (key) ws.height(r, 18); r++; };
    p('GearIn', R.gears ? R.gears.gIn : 1, '', 'Mechanic', 'int', 1);
    p('GearOut', R.gears ? R.gears.gOut : R.i, '', 'Mechanic', R.gears ? 'int' : (R.i % 1 ? 3 : 0), 1);
    if (R.gears) { ws.set(r - 1, 3, 'Mechanic · ' + gearsNote(R.gears), R.gears.exact ? sTxt : s({ color: C.warnT, wrap: 1 })); }
    if (R.feed) p('FeedConstant', R.feed, 'Units/tr', 'Mechanic', feedDec(R.feed), 1);
    p('J_Load', J(R), 'kg·cm²', 'Mechanic', 0, 1);
    p('J_Gear', R.Jg, 'kg·cm²', 'Mechanic', 3, 1);
    p('UserCurrentLimit', R.pct, '%', 'General', 1, 1);
    p('DriveStopCurrentLimit', R.driveStopMa, 'mA', 'General', 0);
    { const NV = R.dec ? null : 'À saisir : vitesse max du cycle (pas celle du moteur)'; p('ControllerStopDec', R.dec || NV, 'Units/s²', 'General', 0); p('ControllerStopJerk', R.dec ? R.jerkStop : NV, 'Units/s³', 'General', 0); p('StopTimeLim', R.dec ? R.stl : NV, 'ms', 'General', 0); }
    p('UserDefinedStopMode', 'Start with actual values', '', 'General');
    p('Vel_P_Gain', g.vp, '', 'Control loop', 1, 1);
    p('Vel_I_Gain', g.vi, '', 'Control loop', 1, 1);
    r++;
    full('CONTRÔLE DU RÉDUCTEUR', sSect, 20);
    if (d.tr.length) {
      th(['Effort', 'Couple en sortie', '% du T2B', 'État']);
      d.tr.forEach(t => { ws.set(r, 0, t.l, sLabel); ws.set(r, 1, t.t, s({ border: 1, h: 'right', fmt: '#,##0" Nm"' })); ws.set(r, 2, t.p / 100, s({ b: 1, border: 1, h: 'right', fmt: '0%', fill: C[t.st], color: C[t.st + 'T'] })); ws.set(r, 3, ETAT[t.st], sStat(t.st)); r++; });
    } else { full('T2B du réducteur non renseigné : couple non contrôlé.', s({ b: 1, fill: C.warn, color: C.warnT, indent: 1 })); }
    line('Courant limite', R.Ilim, 'A', '', sNum(2));
    if (R.vertical) line('Courant de maintien', R.Ihold, 'A', 'Gravité, en permanence', sNum(2));
    line('Inertie vue par le moteur', R.Jtot, 'kg·cm²', '', sNum(2));
    line('Rapport charge/moteur', R.ratioIn, '', R.ratioIn > 10 ? 'Élevé : monter les gains par petites étapes' : '', sNum(2));
    r++;
    full('ALERTES', sSect, 20);
    if (!d.al.length) full('Aucun problème détecté.', s({ b: 1, fill: C.ok, color: C.okT, indent: 1 }), 18);
    (d.R.acked || []).forEach(c => full('ACQUITTÉ le ' + ackDate(c[2].date) + (c[2].note ? ' (' + c[2].note + ')' : '') + ' · ' + c[1], s({ fill: C.grey, color: C.muted, wrap: 1, indent: 1 }), Math.max(18, 15 * Math.ceil(c[1].length / 110))));
    d.al.forEach(c => full((c[0] === 'crit' ? 'DANGER · ' : 'ATTENTION · ') + c[1], s({ fill: C[c[0]], color: C[c[0] + 'T'], wrap: 1, indent: 1, b: c[0] === 'crit' ? 1 : 0 }), Math.max(18, 15 * Math.ceil(c[1].length / 95))));
    if (a.notes) { r++; full('NOTES', sSect, 20); full(a.notes, sWrap, Math.max(18, 15 * Math.ceil(String(a.notes).length / 95))); }
    sheets.push(ws);
  });
  return XL.book(sheets, ST);
}
async function exportProject() {
  const cur = curProj(); if (!cur) return;
  const d = new Date(), day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const name = 'Reglages_' + (cur.nom || 'projet').replace(/[^\w\-]+/g, '_') + '_' + day + '.xlsx';
  let bytes;
  try { bytes = buildXlsx(); } catch (e) { setStatus('Export impossible : ' + (e.message || e), true); return; }
  if (S.dl) {
    try { await S.dl.save({ filename: name, data: bytes }); setStatus('Export enregistré : ' + name); }
    catch (e) { if (e && e.code === 'declined') return; if (e && e.code === 'rate_limited') { setStatus('Un export attend déjà ta confirmation.'); return; } setStatus('Export impossible : ' + ((e && (e.message || e.code)) || 'erreur'), true); }
    return;
  }
  try {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    setStatus('Export enregistré : ' + name);
  } catch (e) { setStatus('Export impossible dans ce navigateur.', true); }
}
/* ---------- Script Machine Expert (IronPython 2.7, API de script CODESYS) ---------- */
const asciiPy = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[‘’]/g, "'").replace(/[“”«»]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\x7E]/g, '?');
const pyU = v => 'u"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[^\x20-\x7E]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '"';
const pyA = v => '"' + asciiPy(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const pyNum = (v, genre) => genre === 'int' ? String(Math.round(v)) : (Number.isInteger(v) ? v.toFixed(1) : String(+Number(v).toPrecision(12)));
const slugOf = t => String(t || 'projet').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') || 'projet';
/* Données hardware du script : catalogue utilisé, matériel du projet, axes dans l'ordre du dossier élec */
function hwAxes() {
  return pAxes().filter(a => a.gamme === 'LXM62' || a.gamme === 'ILM62').slice()
    .sort((a, b) => (num(a.ordre) ?? 1e9) - (num(b.ordre) ?? 1e9) || String(a.nom).localeCompare(String(b.nom), 'fr', { numeric: true }))
    .map(a => [String(a.nom).trim(), a.gamme, a.ioCard ?? a.gamme === 'LXM62', a.leEnc !== false, ioModesOf(a)]);
}
/* Valeur d'un paramètre saisie dans l'outil -> texte pour Machine Expert (virgule décimale -> point) */
const meVal = v => { const t = String(v ?? '').trim(); return /^-?\d+,\d+$/.test(t) ? t.replace(',', '.') : t; };
function hwParamsOf(x, cols) {
  const L = [];
  if (x.nodeId != null) L.push('("Node-ID", ' + Math.round(x.nodeId) + ')');
  if (x.type === 'ATV320') L.push('("@optional", ' + (x.optional === false ? 'False' : 'True') + ')');
  Object.entries(x.params || {}).forEach(([k, v]) => { if (cols.has(k) && meVal(v) !== '') L.push('(' + pyU(k) + ', ' + pyU(meVal(v)) + ')'); });
  return L;
}
function hwHeader(cur) {
  const cat = hwCat(), mat = cur?.materiel || [], ax = hwAxes(), atvCols = new Set((cur?.atvCols || []).map(c => c.n));
  const used = new Set(['LE_Enc', ...mat.map(x => x.type)]);
  ax.forEach(([n, g, c]) => { used.add(g); if (c) used.add(g + '_IO'); });
  if (!ax.some(a => a[3])) used.delete('LE_Enc');
  const tup = t => '(' + hwTuple(t).map((v, k) => k === 0 ? String(v ?? 0) : pyU(v)).join(', ') + ')';
  const L = ['# Catalogue des appareils utilises (onglet Materiel de l\'outil) : type -> (type, id, version, module, parent)', 'CATALOGUE = {'];
  [...used].filter(t => cat[t]).sort().forEach(t => L.push('    ' + pyU(t) + ': ' + tup(cat[t]) + ','));
  L.push('}');
  const absents = [...used].filter(t => !cat[t]);
  if (absents.length) L.push('# Types absents du catalogue (non crees) : ' + asciiPy(absents.join(', ')));
  L.push('', '# Materiel du projet, dans l\'ordre de creation : (nom, type, parent, [(parametre, valeur)])',
    '# "@optional" = case Optional device de l\'ATV320 (3e drapeau de General Options) ; un autre parametre est cherche par son nom exact dans les parametres CANopen de l\'appareil', 'MATERIEL = [');
  mat.forEach(x => L.push('    (' + pyU(x.nom) + ', ' + pyU(x.type) + ', ' + pyU(x.parent || '') + ', [' + hwParamsOf(x, atvCols).join(', ') + ']),'));
  L.push(']', 'ADRESSES_IP = [' + mat.filter(x => x.ip).map(x => '(' + pyU(x.nom) + ', ' + pyU(x.ip) + ')').join(', ') + ']', '',
    '# Axes brushless dans l\'ordre Sercos (onglet Brushless) : (axe, type de variateur, carte IO, codeur LE_, modes de la carte IO)',
    '# Un module double Lexium 62 = deux variateurs declares comme des simples', 'AXES_HW = [');
  ax.forEach(([n, g, c, e, m]) => L.push('    (' + pyU(n) + ', ' + pyU(g) + ', ' + (c ? 'True' : 'False') + ', ' + (e ? 'True' : 'False') + ', [' + IO_MODES.map(k => '("' + k + '", ' + (+m[k] || 0) + ')').join(', ') + ']),'));
  L.push(']');
  return L;
}
function buildMeScript(o) {
  const cur = curProj(), now = new Date();
  const when = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const rows = [], ign = [];
  pAxes().forEach(a => {
    const nom = String(a.nom || '').trim();
    if (!nom) { ign.push(['(sans nom)', 'axe sans nom']); return; }
    if (a.gamme === 'BMP') { ign.push([nom, 'moteur sur ATV320 : pas de DRV_, reglages du variateur en Modbus']); return; }
    const R = compute(a);
    if (R.missing) { ign.push([nom, R.why || 'moteur ou reducteur manquant']); return; }
    const L = [], skip = [];
    if (o.meca) {
      if (R.feed != null) L.push(['FeedConstant', R.feed, 'real', 'outil']);
      if (R.gears) { const src = R.gears.exact ? 'rapport exact' : 'rapport catalogue arrondi, a confirmer'; L.push(['GearIn', R.gears.gIn, 'int', src], ['GearOut', R.gears.gOut, 'int', src]); }
      L.push(['J_Load', Math.round(R.JL / 10) * 10, 'real', 'calcule par l\'outil'], ['J_Gear', R.Jg, 'real', R.r.jGear == null ? 'non renseigne : 0' : 'fiche reducteur']);
    }
    if (o.lim && R.pct != null) L.push(['UserCurrentLimit', R.pct, 'real', 'limite calculee']);
    if (o.stop) {
      if (R.driveStopMa != null) L.push(['DriveStopCurrentLimit', R.driveStopMa, 'int', 'mA, part de T2B autorisee']);
      if (R.dec) L.push(['ControllerStopDec', R.dec, 'real', 'vitesse du cycle / duree d\'arret'], ['ControllerStopJerk', R.jerkStop, 'real', 'calcule par l\'outil'], ['StopTimeLim', R.stl, 'int', 'ms, duree d\'arret + 25 %']);
      else skip.push('ControllerStopDec, ControllerStopJerk, StopTimeLim : vitesse max du cycle non saisie dans l\'outil');
      L.push(['UserDefinedStopMode', 'Start with actual values', 'enum', 'recommande par l\'outil']);
    }
    if (o.gains) { const g = gainsOf(a, R); L.push(['Vel_P_Gain', g.vp, 'real', g.vpSrc], ['Vel_I_Gain', g.vi, 'real', g.viSrc]); }
    const al = R.checks.filter(c => c[0] === 'crit').map(c => asciiPy(c[1]).slice(0, 170)).concat(skip.map(asciiPy));
    if (L.length) rows.push({ nom, al, L, R });
  });
  const slug = slugOf(cur?.nom);
  const groupes = [o.meca ? 'Mechanic (FeedConstant, GearIn, GearOut, J_Load, J_Gear)' : null, o.lim ? 'UserCurrentLimit' : null, o.stop ? 'Arret (DriveStopCurrentLimit, ControllerStopDec, ControllerStopJerk, StopTimeLim, UserDefinedStopMode)' : null, o.gains ? 'Vel_P_Gain / Vel_I_Gain' : null].filter(Boolean).join(' + ');
  const H = [
    '# -*- coding: utf-8 -*-',
    '# =====================================================================',
    '#  Reglages servo -> Machine Expert',
    '#  Projet : ' + asciiPy(cur?.nom || ''),
    '#  Genere le ' + asciiPy(when) + ' par l\'outil Reglages servo',
    '#  Parametres : ' + asciiPy(groupes),
    '# =====================================================================',
    '#  Mode d\'emploi',
    '#   1. Ouvre le projet dans Machine Expert (hors ligne).',
    '#   2. Lance ce script comme vos autres scripts Python : avant chaque axe',
    '#      une fenetre liste les parametres a modifier (ancien -> nouveau) :',
    '#      Oui / Oui a tous / Non (passer cet axe) / Arreter.',
    '#      Rapport dans Documents.',
    '#   Hardware (CREER_HARDWARE) : cree d\'abord ce qui manque, sans rien',
    '#      supprimer : CAN, ATV320, alimentations, TM5, Ethernet/IP, puis pour',
    '#      chaque axe le codeur LE_, le variateur DRV_ et la carte IO_.',
    '#      Une fenetre liste les appareils a creer avant de commencer.',
    '#      Ensuite il ecrit les reglages du materiel : Node-ID, Optional device',
    '#      et parametres des ATV320, modes des cartes IO_ (onglets ATV320 et',
    '#      Brushless de l\'outil).',
    '#   3. A la fin, le script cree ou complete la liste de parametres',
    '#      LISTE_PARAMETRES (sous Application) : tous les axes traites et une',
    '#      colonne par parametre regle, pour voir les valeurs d\'un coup.',
    '#   4. Verifie quelques valeurs puis enregistre le projet.',
    '#  Pour seulement voir les ecarts sans rien modifier : SIMULATION = True.',
    '#  Seuls les parametres listes plus bas sont touches.',
    '#  Variateur cherche = PREFIXE + nom de l\'axe dans l\'outil (ex. DRV_MT1).',
    '# =====================================================================',
    'from __future__ import print_function',
    'import os, codecs',
    '',
    'SIMULATION = False       # False : ecrit les valeurs ; True : affiche seulement les ecarts',
    'DEMANDER = True          # True : fenetre de confirmation avant chaque axe (Oui / Oui a tous / Non / Arreter)',
    'PREFIXE = "DRV_"         # nom du variateur dans le projet = PREFIXE + nom de l\'axe',
    'FACTEUR_INERTIE = 1.0    # J_Load / J_Gear en kg.cm2 dans l\'outil ; 0.0001 si Machine Expert attend des kg.m2',
    'FICHIER_RAPPORT = os.path.join(os.path.expanduser("~"), "Documents", "rapport_reglages_' + slug + '.txt")',
    'LISTE_PARAMETRES = ' + (o.liste ? '"ParameterList_Reglages"' : '""') + '   # liste de parametres creee / completee a la fin ("" = pas de liste)',
    'CREER_TRACES = ' + (o.traces ? 'True ' : 'False') + '   # True : traces TRC_Axes_MT / MC / MP / MR recreees (4 diagrammes par axe : vitesse, position, erreur de poursuite, courant)',
    'TACHE_TRACE = ' + pyU(TACHE_CAN(cur)) + '   # tache d\'echantillonnage des traces',
    'TRACES_TOUS_LES_AXES = True   # True : tous les DRV_ physiques du projet ; False : seulement les axes de l\'outil (AXES_HW)',
    'TRACES_MAX_AXES = 0   # 0 = une trace par famille ; ex. 8 = TRC_Axes_MC_1, _2... de 8 axes maxi',
    'CREER_HARDWARE = ' + (o.hw ? 'True ' : 'False') + '    # True : cree les appareils qui manquent (materiel du projet + DRV_ / IO_ / LE_ des axes)',
    'RENOMMER_EXISTANTS = False   # un appareil deja present sous un autre nom (meme parent, meme reference) : True = le renommer comme dans l\'outil, False = le garder tel quel',
    'HEARTBEAT_MS = ' + HB_MS(cur) + '   # Producer time (heartbeat) des ATV320, arrondi au multiple le plus proche du cycle de la tache de bus de l\'ATV320 ; 0 = ne pas toucher',
    'TACHE_CAN = ' + pyU(TACHE_CAN(cur)) + '   # tache de secours pour le cycle, si la tache de cycle de bus de l\'ATV320 n\'est pas lisible dans le projet',
    '',
    'PROJET = ' + pyU(cur?.nom || ''),
    'INERTIES = ("J_Load", "J_Gear")',
    '',
    '# (axe, alertes critiques de l\'outil, [(parametre, valeur, type, origine), ...])',
    'REGLAGES = ['
  ];
  rows.forEach(({ nom, al, L, R }) => {
    H.push('    # ' + asciiPy(nom) + ' : ' + asciiPy(R.m.ref) + ' + ' + asciiPy(R.r.ref));
    H.push('    (' + pyU(nom) + ', [' + al.map(pyA).join(', ') + '], [');
    L.forEach(([k, v, t, src]) => H.push('        ("' + k + '", ' + (t === 'txt' || t === 'enum' ? pyA(v) : pyNum(v, t)) + ', "' + t + '", ' + pyA(src) + '),'));
    H.push('    ]),');
  });
  H.push(']', '', '# Axes du projet de l\'outil qui ne sont pas dans le script', 'AXES_IGNORES = [');
  ign.forEach(([n, r]) => H.push('    (' + pyU(n) + ', ' + pyA(r) + '),'));
  H.push(']', '', ...hwHeader(cur), '', '# ---------------------------------------------------------------------', '# Code commun (ne pas modifier)', '# ---------------------------------------------------------------------');
  return H.join('\n') + '\n' + ME_CORE.replace(/^\n+/, '').replace('# @@HARDWARE@@', HW_CORE).replace('# @@TRACES@@', TRACE_CORE.trim());
}
async function exportMeScript(o) {
  const cur = curProj(); if (!cur) return;
  let py;
  try { py = buildMeScript(o); } catch (e) { setStatus('Script impossible : ' + (e.message || e), true); return; }
  const d = new Date(), day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const slug = slugOf(cur.nom), pyName = 'reglages_' + slug + '.py';
  if (S.dl) {
    const zipName = 'Script_MachineExpert_' + slug + '_' + day + '.zip';
    try { await S.dl.save({ filename: zipName, data: XL.zip([{ name: pyName, data: py }]) }); setStatus('Script enregistré : ' + zipName + ' (extraire ' + pyName + ').'); }
    catch (e) { if (e && e.code === 'declined') return; if (e && e.code === 'rate_limited') { setStatus('Un téléchargement attend déjà ta confirmation.'); return; } setStatus('Script impossible : ' + ((e && (e.message || e.code)) || 'erreur'), true); }
    return;
  }
  try {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([py], { type: 'text/x-python' })); a.download = pyName;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    setStatus('Script enregistré : ' + pyName);
  } catch (e) { setStatus('Script impossible dans ce navigateur.', true); }
}
/* ---------- Import du dossier électrique (lu dans le navigateur, jamais enregistré ni envoyé) ---------- */
const nrmE = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
async function xlsxSheets(buf, wanted) {
  if (typeof DecompressionStream === 'undefined') throw new Error('ce navigateur ne sait pas lire un fichier Excel (prendre Edge ou Chrome récent)');
  const u8 = new Uint8Array(buf), dv = new DataView(buf), td = new TextDecoder();
  let e = u8.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('ce n’est pas un fichier Excel (.xlsx / .xlsm)');
  const files = {}; let p = dv.getUint32(e + 16, true);
  for (let k = 0, n = dv.getUint16(e + 10, true); k < n && dv.getUint32(p, true) === 0x02014b50; k++) {
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    files[td.decode(u8.subarray(p + 46, p + 46 + nl))] = { m: dv.getUint16(p + 10, true), cs: dv.getUint32(p + 20, true), lh: dv.getUint32(p + 42, true) };
    p += 46 + nl + xl + cl;
  }
  const get = async name => {
    const f = files[name]; if (!f) return null;
    const s = f.lh + 30 + dv.getUint16(f.lh + 26, true) + dv.getUint16(f.lh + 28, true), d = u8.subarray(s, s + f.cs);
    if (f.m === 0) return td.decode(d);
    return td.decode(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  };
  const xml = async name => { const t = await get(name); return t ? new DOMParser().parseFromString(t, 'application/xml') : null; };
  const tags = (doc, tag) => Array.from(doc.getElementsByTagNameNS('*', tag));
  const wb = await xml('xl/workbook.xml'), rels = await xml('xl/_rels/workbook.xml.rels');
  if (!wb || !rels) throw new Error('classeur illisible');
  const target = {}; tags(rels, 'Relationship').forEach(r => { target[r.getAttribute('Id')] = r.getAttribute('Target'); });
  const ssDoc = await xml('xl/sharedStrings.xml');
  const ss = ssDoc ? tags(ssDoc, 'si').map(si => tags(si, 't').filter(t => t.parentNode.localName !== 'rPh').map(t => t.textContent).join('')) : [];
  const out = {};
  /* noms de tous les onglets du classeur (non énumérable : Object.keys(out) ne donne que les feuilles lues) */
  Object.defineProperty(out, '_onglets', { value: tags(wb, 'sheet').map(s => s.getAttribute('name')), enumerable: false });
  for (const sh of tags(wb, 'sheet')) {
    const name = sh.getAttribute('name');
    if (!wanted.some(w => nrmE(w) === nrmE(name))) continue;
    const rid = sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || sh.getAttribute('r:id');
    let t = target[rid] || ''; t = t.startsWith('/') ? t.slice(1) : 'xl/' + t.replace(/^\.\//, '');
    const doc = await xml(t); if (!doc) continue;
    const rows = [];
    for (const c of tags(doc, 'c')) {
      const m = /^([A-Z]+)(\d+)$/.exec(c.getAttribute('r') || ''); if (!m) continue;
      let col = 0; for (const ch of m[1]) col = col * 26 + ch.charCodeAt(0) - 64;
      const ty = c.getAttribute('t'), v = tags(c, 'v')[0]?.textContent;
      let val = null;
      if (ty === 's') val = ss[+v] ?? null;
      else if (ty === 'inlineStr') val = tags(c, 't').map(x => x.textContent).join('');
      else if (ty === 'str') val = v ?? null;
      else if (ty === 'b') val = v === '1';
      else if (ty !== 'e' && v != null && v !== '') val = isNaN(+v) ? v : +v;
      if (val === null || val === '') continue;
      (rows[+m[2] - 1] = rows[+m[2] - 1] || [])[col - 1] = val;
    }
    out[name] = rows;
  }
  return out;
}
/* Catalogue d'appareils Machine Expert (dictionnaire de l'Auto_Pannel) : type -> [type, id, version, module, parent] */
const HW_CAT = {
  CAN_Layer: [15, '1003 0098', '1.76.3.0', '', 'LMC_PacDrive'], CAN_Manager: [16, '1003 008B', '1.76.3.0', '', 'CAN_Layer'],
  ATV320: [18, '101A 2038', '1.2.11.0', '', 'CAN_Manager'],
  ILM62: [4096, 'plc_id', 'plc_v', 'ILM62', 'Sercos_Master'], LXM62: [4096, 'plc_id', 'plc_v', 'LXM62DxS', 'Sercos_Master'],
  LXM62_IO: [4096, 'plc_id', 'plc_v', 'LXM62IO', 'LXM62'], ILM62_IO: [4096, 'plc_id', 'plc_v', 'DIO8', 'ILM62'], LE_Enc: [4096, 'plc_id', 'plc_v', 'L_ENC', 'LMC_PacDrive'],
  TM5NS31: [71, '1_TM5', 'plc_v', '', 'Sercos_Master'],
  TM5SBET1: [72, '1_0x1bc2', '1.56.15.2', '', 'TM5NS31'], TM5SBER2: [72, '1_0x1bc1', '1.56.15.2', '', 'TM5NS31'], TM5C24D12R: [72, '1_0xb0d7', '1.56.15.2', '', 'TM5NS31'],
  TM5SDI12D: [72, '1_0x1b95', '1.56.15.2', '', 'TM5NS31'], TM5SDO8TA: [72, '1_0x1b9d', '1.56.15.2', '', 'TM5NS31'], TM5SDO4R: [72, '1_0xa704', '1.56.15.2', '', 'TM5NS31'],
  TM5SE1IC20005: [72, '1_0xb76b', 'plc_v', '', 'TM5NS31'], TM5SDI2DF: [72, '1_0x1b8e', '1.56.15.2', '', 'TM5NS31'], TM5SDI4DFS: [72, '1_0x1dbd', '6.20.113.240119', '', 'TM5NS31'],
  TM5SDO4TAFS: [72, '1_0x2007', '6.20.113.240119', '', 'TM5NS31'], LXM62PS: [4096, '1003 0082', '1.80.1.2', 'LXM62PS', 'Sercos_Master'],
  TM5SAO2L: [72, '1_0x1ba2', '1.56.15.2', '', 'TM5NS31'], TM5SAO4L: [72, '1_0x1ba3', '1.56.15.2', '', 'TM5NS31'],
  TM5SPS3: [72, '1_0x1f8c', '1.56.15.2', '', 'TM5NS31'],
  EIPS_Scanner: [100, '1003 00A4', '1.78.11.0', '', 'LMC_PacDrive'], EX500_GEN2: [101, '7_12_198_3', 'Major Revision=16#3, Minor Revision = 16#1', '', 'EIPS_Scanner']
};
const HW_FAM0 = t => t === 'CAN_Layer' || t === 'CAN_Manager' ? 'CAN' : t === 'ATV320' ? 'Variateur CAN' : t === 'LXM62PS' ? 'Alimentation' : t === 'TM5NS31' ? 'Tête de bus TM5' : /^TM5/.test(t) ? 'Module TM5' : t === 'LXM62' || t === 'ILM62' ? 'Variateur Sercos' : /_IO$/.test(t) ? 'Carte IO' : t === 'LE_Enc' ? 'Codeur' : t === 'EIPS_Scanner' || (HW_CAT[t] && HW_CAT[t][4] === 'EIPS_Scanner') ? 'Ethernet/IP' : 'Autre';
const HW_ALIAS = { LXM62PS: 'LXM62PD', EX500_GEN2: 'EX500-GEN2' };
/* Parent « TM5NS31 » ou « BC_… » (ancien nom de la tête dans le Dico) : sous la tête de bus TM5 qui précède */
const sousTete = p => p === 'TM5NS31' || /^BC_/.test(String(p || ''));
/* Catalogue intégré (dictionnaire Auto_Pannel) ; une fiche enregistrée dans l'onglet Matériel le remplace */
/* Nom de l'appareil dans Machine Expert : modèle par type (catalogue, champ « Nom dans l'automate »), remplaçable pour un projet (Renommer).
   {dossier} = nom donné par le dossier élec, {n} = n° d'ordre de ce type dans le projet, {ilot} = n° de l'îlot TM5, {type} = la référence, {axe} = repère de l'axe */
const HW_NOM = { TM5SPS3: 'PS_{ilot}', ATV320: 'ATV320_{dossier}', CAN_Layer: 'CAN_Layer', CAN_Manager: 'CAN_Manager', EIPS_Scanner: 'EIPS_Scanner', LXM62: 'DRV_{axe}', ILM62: 'DRV_{axe}', LXM62_IO: 'IO_{axe}', ILM62_IO: 'IO_{axe}', LE_Enc: 'LE_{axe}' };
const hwNomAuto = t => String(hwCat()[t]?.nomAuto || HW_NOM[t] || (/^TM5SPS3/.test(refKey(t)) ? 'PS_{ilot}' : '{dossier}')).trim() || '{dossier}';
function hwNommer(type, c) {
  const pat = hwNomAuto(type), n = c.n ?? 1, ilot = c.ilot ?? n, dossier = hwName(c.dossier || '');
  if (/\{dossier\}/i.test(pat) && !dossier) return hwName(type) + '_' + n;
  const s = hwName(pat.replace(/\{dossier\}/gi, dossier).replace(/\{n\}/gi, n).replace(/\{ilot\}/gi, ilot).replace(/\{type\}/gi, type).replace(/\{axe\}/gi, c.axe || dossier));
  return s || hwName(type) + '_' + n;
}
const hwUnique = (nom, noms) => { let s = nom, k = 1; while (noms.has(s)) s = nom + '_' + (++k); return s; };
/* Donne un nom aux appareils qui n'en ont pas encore (x.dossier = nom du dossier élec) ; only = ne traiter que ceux-là */
function hwNoms(items, warn, only) {
  const cnt = {}, noms = new Set(items.filter(x => x.nom).map(x => x.nom)), heads = items.filter(x => x.type === 'TM5NS31'), renom = {};
  items.forEach(x => {
    if (x.nom || (only && !only(x))) return;
    const n = (cnt[x.type] = (cnt[x.type] || 0) + 1), hi = heads.findIndex(h => h.nom && h.nom === x.parent);
    const nom = hwUnique(hwNommer(x.type, { dossier: x.dossier, n, ilot: hi >= 0 ? hi + 1 : n }), noms);
    noms.add(nom); x.nom = nom;
    if (x.dossier && !x.auto && !/\{dossier\}/i.test(hwNomAuto(x.type)) && nom !== hwName(x.dossier)) (renom[x.type] = renom[x.type] || []).push(x.dossier + ' → ' + nom);
  });
  if (warn) Object.entries(renom).forEach(([t, l]) => { if (l.some(x => !/^$/.test(x))) warn.push(t + ' : nommé d’après le catalogue (modèle ' + hwNomAuto(t) + ') : ' + l.slice(0, 3).join(', ') + (l.length > 3 ? '…' : '') + '. Mets {dossier} dans « Nom dans l’automate » du type pour garder le nom du dossier.'); });
  return items;
}
function hwBuiltin() {
  return Object.entries(HW_CAT).map(([ref, c]) => ({ id: 'hw-' + ref.toLowerCase().replace(/[^a-z0-9]+/g, '-'), ref, serie: HW_FAM0(ref), devType: c[0], devId: c[1], devVer: c[2], module: c[3], parent: c[4], alias: HW_ALIAS[ref] || '', nomAuto: HW_NOM[ref] || '{dossier}', _cat: true, notes: ref === 'TM5SPS3' ? 'Dictionnaire Auto_Pannel (Config_A3). PS3 = alimentation de la tête de bus et du bus TM5 : toujours en premier dans l’îlot. Les PS1 / PS2 (TM5SPS1, TM5SPS2 : nouveau segment de puissance plus loin dans l’îlot) sont à ajouter au catalogue avec leur DeviceID (explorer_materiel.py).' : 'Dictionnaire Auto_Pannel (Config_A3)' }));
}
function hwCat() { const m = {}; S.hwtypes.filter(x => x._cat).forEach(x => { m[x.ref] = x; }); S.hwtypes.filter(x => !x._cat && x.ref).forEach(x => { m[x.ref] = x; }); if (!S.hwtypes.length) hwBuiltin().forEach(x => { m[x.ref] = x; }); return m; }
const HW_FAM = t => hwCat()[t]?.serie || HW_FAM0(t);
const hwTuple = t => [num(t.devType), String(t.devId ?? ''), String(t.devVer ?? ''), String(t.module ?? ''), String(t.parent ?? '')];
const hwAliasOf = (E, cat) => { const k = refKey(E); if (!k) return null; for (const t of Object.values(cat)) for (const a of String(t.alias || '').split(',').map(refKey).filter(Boolean)) if (k.startsWith(a)) return t.ref; return null; };
const EIPS_IP = '192.168.27.130';
/* Nom d'appareil comme la macro Auto_Pannel : accents retirés, espaces et tirets -> _ */
const hwName = s => String(s ?? '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ -]/g, '_');
const cellTxt = v => v == null ? '' : String(v).trim();
function parseMateriel(sheets, asyn) {
  const items = [], warn = [];
  const atv = asyn.filter(a => /^ATV320/i.test(a.gamme));
  if (atv.length) {
    items.push({ dossier: 'CAN_Layer', type: 'CAN_Layer' }, { dossier: 'CAN_Manager', type: 'CAN_Manager' });
    atv.forEach((a, k) => items.push({ dossier: a.nom, type: 'ATV320', nodeId: k + 1, desc: a.desc, ...(a.ref ? { ref: a.ref } : {}), ...(a.moteurRef ? { moteurRef: a.moteurRef } : {}), ...(a.bmp ? { bmp: true } : {}),
      ...(a.fab ? { moteurFab: a.fab } : {}), ...(a.p != null ? { moteurP: a.p } : {}), ...(a.iN != null ? { moteurI: a.iN } : {}), ...(a.n != null ? { moteurN: a.n } : {}), ...(a.u ? { moteurU: a.u } : {}), ...(a.poles != null ? { moteurPoles: a.poles } : {}) }));
  }
  const key = Object.keys(sheets).find(k => nrmE(k) === 'materiels');
  if (!key) { warn.push('onglet « Matériels » introuvable : seuls le CAN et les ATV320 sont repris'); hwNoms(items, warn); return { items, warn }; }
  const ps = [], bus = [], eth = [], cat = hwCat(), auto = {}, byKey = {};
  Object.keys(cat).forEach(t => { byKey[refKey(t)] = t; });
  sheets[key].forEach((r, i) => {
    if (!r) return;
    const B = cellTxt(r[1]), C = cellTxt(r[2]), E = cellTxt(r[4]), O = cellTxt(r[14]), P = cellTxt(r[15]), R = cellTxt(r[17]);
    const al = cat[E] ? E : (byKey[refKey(E)] || hwAliasOf(E, cat)), fam = al ? (cat[al].serie || HW_FAM0(al)) : '';
    const nomB = hwName(B) + (R ? '_' + R : '');
    const estEth = ['ethernetip', 'eip', 'ethip', 'enip'].includes(nrmE(O).replace(/[^a-z]/g, '')) || (al && (cat[al].parent === 'EIPS_Scanner' || fam === 'Ethernet/IP'));
    if (estEth) eth.push({ dossier: nomB, type: al || E.replace(/-/g, '_'), ip: P, ref: E, ligne: i + 1 });
    else if (fam === 'Alimentation') ps.push({ dossier: nomB, type: al, ref: E, ligne: i + 1 });
    else if (C && E && (al || /^TM5/i.test(E))) bus.push({ dossier: C, type: al || E, ligne: i + 1 });
    else if (!C && /^TM5SPS/i.test(refKey(E))) {
      /* alimentation de l'îlot TM5 sans nom TM5 dans le dossier : nommée d'après le catalogue (PS_{ilot}), ou colonne B si le modèle est {dossier} */
      const t = al || E.toUpperCase();
      bus.push({ dossier: B ? nomB : '', type: t, ligne: i + 1, auto: true });
      auto[t] = 1;
    }
  });
  items.push(...ps, ...bus);
  if (eth.length) items.push({ dossier: 'EIPS_Scanner', type: 'EIPS_Scanner', ip: EIPS_IP }, ...eth);
  /* même nom de dossier deux fois (même type) : gardé une fois */
  const vuD = new Set();
  let items2 = items.filter(x => { const k = x.type + '|' + x.dossier; if (x.dossier && vuD.has(k)) { warn.push('« ' + x.dossier + ' » en double dans le dossier : gardé une fois'); return false; } vuD.add(k); return true; });
  items.length = 0; items.push(...items2);
  hwNoms(items, null, x => x.type === 'TM5NS31');   // les têtes d'abord : les modules s'y rattachent
  // parent réel : un appareil dont le parent est TM5NS31 va sous la dernière tête de bus rencontrée
  let tete = null;
  items.forEach(x => { const c = cat[x.type]; if (x.type === 'TM5NS31') tete = x.nom; const par = c ? c.parent : (/^TM5/.test(x.type) ? 'TM5NS31' : '?'); x.parent = sousTete(par) && x.type !== 'TM5NS31' ? (tete || 'TM5NS31 ?') : par; x.connu = !!c; });
  /* module listé avant sa tête de bus (parent inconnu) : il appartient à l'îlot qui suit */
  items.forEach((x, k) => { if (x.parent === 'TM5NS31 ?') { const h = items.slice(k + 1).find(y => y.type === 'TM5NS31') || items.find(y => y.type === 'TM5NS31'); if (h) { x.parent = h.nom; warn.push('« ' + (x.dossier || x.type) + ' » listé avant sa tête de bus : rattaché à ' + h.nom); } } });
  hwNoms(items, warn);
  Object.keys(auto).forEach(t => { const l = items.filter(x => x.auto && x.type === t); if (l.length) warn.push('« ' + l.map(x => x.nom).join(' », « ') + ' » (' + t + ') : colonne C vide dans le dossier, nom ' + (/\{dossier\}/i.test(hwNomAuto(t)) ? 'repris de la colonne B' : 'donné par le catalogue (modèle ' + hwNomAuto(t) + (l[0].dossier ? ', colonne B : ' + l.map(x => x.dossier).join(', ') : '') + ')') + ' ; vérifie sa place dans l’îlot TM5'); });
  let out = tm5Alims(items, warn);
  { const r = busCompleter(out); if (r.ajoutes.length) { out = r.out.map(x => { const y = { ...x }; delete y.src; delete y.apres; return y; }); warn.push(r.ajoutes.join(', ') + ' ajouté' + (r.ajoutes.length > 1 ? 's' : '') + ' : des appareils du dossier sont déclarés dessous'); } }
  if (out.some(x => !x.connu)) warn.push('types absents du catalogue d’appareils : ' + [...new Set(out.filter(x => !x.connu).map(x => x.type))].join(', ') + ' (le script ne saura pas les créer)');
  return { items: out, warn };
}
/* Chaque tête de bus TM5 (TM5NS31) commence par sa carte d'alimentation TM5SPS3 (« PS3 », alimente la tête et le bus TM5) :
   elle est mise en premier, ou ajoutée si le dossier ne la donne pas. Les PS1 / PS2 (TM5SPS1, TM5SPS2 : nouveau segment
   de puissance) restent à leur place dans l'îlot. Renvoie la liste réordonnée ; les ajouts sont signalés dans warn. */
const estAlimTm5 = x => /^TM5SPS3/.test(refKey(x.type));
const ALIM_TM5_TYPE = () => hwCat()['TM5SPS3'] ? 'TM5SPS3' : (Object.keys(hwCat()).find(t => /^TM5SPS3/i.test(t)) || 'TM5SPS3');
function tm5Alims(items, warn) {
  const heads = items.filter(x => x.type === 'TM5NS31');
  if (!heads.length) return items;
  const noms = new Set(items.map(x => x.nom)), alimOf = new Map();
  heads.forEach(h => { const e = items.filter(y => y.parent === h.nom); alimOf.set(h.nom, { al: e.find(estAlimTm5), first: e[0] }); });
  const out = [], places = new Set();
  let k = 0;
  items.forEach(x => {
    if (places.has(x)) return;
    out.push(x);
    if (x.type !== 'TM5NS31') return;
    k++;
    const { al, first } = alimOf.get(x.nom);
    if (al) {
      if (first !== al || items.indexOf(al) < items.indexOf(x)) { const i = out.indexOf(al); if (i >= 0) out.splice(i, 1); out.push(al); places.add(al); if (warn) warn.push('« ' + al.nom + ' » placée juste après la tête de bus ' + x.nom + ' (première carte de l’îlot)'); }
      return;
    }
    const orph = items.find(y => estAlimTm5(y) && !heads.some(h => h.nom === y.parent) && !places.has(y));
    if (orph) { const i = out.indexOf(orph); if (i >= 0) out.splice(i, 1); orph.parent = x.nom; out.push(orph); places.add(orph); if (warn) warn.push('« ' + orph.nom + ' » rattachée à la tête de bus ' + x.nom + ' comme carte d’alimentation'); return; }
    const t = ALIM_TM5_TYPE(), nom = hwUnique(hwNommer(t, { n: items.filter(estAlimTm5).length + k, ilot: k }), noms); noms.add(nom);
    out.push({ nom, type: t, parent: x.nom, auto: true, connu: !!hwCat()[t] });
    if (warn) warn.push('« ' + nom + ' » (' + t + ') ajoutée après la tête de bus ' + x.nom + ' : chaque îlot TM5 commence par sa carte TM5SPS3 (PS3), le dossier n’en donnait pas. Vérifie la référence.');
  });
  return out;
}
/* Nœuds de bus manquants : un appareil sous EIPS_Scanner ou CAN_Manager sans ce nœud dans la liste (contrôle du matériel du projet) */
const BUS_CHAINE = { EIPS_Scanner: [{ nom: 'EIPS_Scanner', type: 'EIPS_Scanner', parent: 'LMC_PacDrive', ip: EIPS_IP }], CAN_Manager: [{ nom: 'CAN_Layer', type: 'CAN_Layer', parent: 'LMC_PacDrive' }, { nom: 'CAN_Manager', type: 'CAN_Manager', parent: 'CAN_Layer' }] };
function busManquants(L) {
  const noms = new Set(L.map(x => x.nom)), types = new Set(L.map(x => x.type));
  return Object.keys(BUS_CHAINE).filter(b => L.some(x => x.parent === b) && !noms.has(b) && !types.has(b));
}
function busCompleter(L) {
  const out = L.slice(), ajoutes = [];
  busManquants(L).forEach(b => {
    const at = out.findIndex(x => x.parent === b);
    BUS_CHAINE[b].forEach((n, k) => { if (!out.some(x => x.nom === n.nom || x.type === n.type)) { const x = { ...n, src: 'manuel', apres: k ? BUS_CHAINE[b][k - 1].nom : out[at - 1]?.nom }; out.splice(at + k, 0, x); ajoutes.push(n.nom); } });
  });
  return { out, ajoutes };
}
/* Têtes de bus TM5 du projet sans carte d'alimentation en premier (contrôle affiché dans le matériel du projet) */
function tm5SansAlim(L) {
  return L.filter(x => x.type === 'TM5NS31').filter(h => { const e = L.filter(y => y.parent === h.nom); return !e.length || !estAlimTm5(e[0]); }).map(h => h.nom);
}
function hwDiff(newItems) {
  const old = curProj()?.materiel || [], oldE = old.filter(x => x.src !== 'manuel'), man = old.filter(x => x.src === 'manuel');
  const byN = new Map(oldE.map(x => [x.nom, x])), newN = new Set(newItems.map(x => x.nom)), manN = new Map(man.map(x => [x.nom, x]));
  const sig = x => [x.type, x.parent, x.ip || '', x.nodeId || '', x.ref || '', x.moteurRef || '', x.moteurFab || '', x.moteurP ?? '', x.moteurI ?? '', x.moteurN ?? '', x.moteurU || ''].join('|');
  /* ATV320 importé avant avec le folio dans le nom (ATV320_11M1) : c'est le même appareil, renommé ATV320_M1 */
  const propre = n => { const m = /^(ATV320_)(.+)$/.exec(n); return m ? m[1] + sansFolio(m[2]) : n; };
  const byPropre = new Map(oldE.filter(x => propre(x.nom) !== x.nom).map(x => [propre(x.nom), x])), pris = new Set(), renommes = [];
  /* même appareil du dossier (type + nom du dossier) sous un autre nom : modèle du catalogue changé, ou renommé dans le projet (nom gardé) */
  const byDos = new Map(oldE.filter(x => x.dossier).map(x => [x.type + '|' + x.dossier, x]));
  const libre = c => c && !newN.has(c.nom) && !pris.has(c.nom);
  const paires = newItems.map(x0 => {
    let o = byN.get(x0.nom);
    if (!o && libre(byPropre.get(x0.nom))) o = byPropre.get(x0.nom);
    if (!o && x0.dossier && libre(byDos.get(x0.type + '|' + x0.dossier))) o = byDos.get(x0.type + '|' + x0.dossier);
    if (o) pris.add(o.nom);
    return { x0, o };
  });
  /* parents renommés (tête de bus renommée dans le projet, ou modèle du catalogue changé) : les enfants suivent */
  const ren = new Map(paires.filter(q => q.o && q.o.nom !== q.x0.nom && q.o.nomFixe).map(q => [q.x0.nom, q.o.nom]));
  paires.forEach(q => { if (ren.has(q.x0.parent)) q.x0 = { ...q.x0, parent: ren.get(q.x0.parent) }; });
  /* appareil sans nom de dossier (alimentation ajoutée par l'outil) : même type sous le même parent = le même */
  const byTP = new Map(oldE.filter(x => !x.dossier).map(x => [x.type + '|' + x.parent, x]));
  paires.forEach(q => { if (!q.o && !q.x0.dossier && libre(byTP.get(q.x0.type + '|' + q.x0.parent))) { q.o = byTP.get(q.x0.type + '|' + q.x0.parent); pris.add(q.o.nom); } });
  const rows = paires.map(({ x0, o }) => {
    const k = o || manN.get(x0.nom), x = k ? hwKeep(k, x0) : x0;
    if (o && o.nom !== x.nom) renommes.push(o.nom + ' → ' + x.nom);
    return { ...x, etat: !o ? 'nouveau' : o.nom !== x.nom || sig(o) !== sig(x) ? 'maj' : 'ok' };
  });
  const retires = oldE.filter(x => !newN.has(x.nom) && !pris.has(x.nom)).map(x => x.nom);
  const remplaces = man.filter(x => newN.has(x.nom)).map(x => x.nom);
  const n = { nouveau: rows.filter(r => r.etat === 'nouveau').length, maj: rows.filter(r => r.etat === 'maj').length, retires: retires.length };
  return { rows, retires, remplaces, renommes, man: man.filter(x => !newN.has(x.nom)), n, change: n.nouveau + n.maj + n.retires > 0 || remplaces.length > 0 };
}
/* Réglages faits dans l'outil sur un appareil du dossier : gardés quand on réimporte */
const HW_KEEP = ['params', 'optional', 'moteurId'];
function hwKeep(o, x) {
  const y = { ...x };
  HW_KEEP.forEach(k => { if (o[k] != null) y[k] = o[k]; });
  if (o.nomFixe && o.nom) { y.nom = o.nom; y.nomFixe = true; }
  if (o.nodeIdManuel && o.nodeId != null) { y.nodeId = o.nodeId; y.nodeIdManuel = true; }
  return y;
}
const hwClean = x => { const o = { nom: x.nom, type: x.type, parent: x.parent }; ['ip', 'nodeId', 'nodeIdManuel', 'desc', 'ref', 'moteurRef', 'bmp', 'moteurFab', 'moteurP', 'moteurI', 'moteurN', 'moteurU', 'moteurPoles', 'auto', 'dossier', 'nomFixe', ...HW_KEEP].forEach(k => { if (x[k] != null && x[k] !== '') o[k] = x[k]; }); return o; };
function hwTable(list, withState, del) {
  const ren = del && S.hwRen != null ? S.hwRen : -1;
  return `<div class="tblwrap elecwrap"><table><thead><tr><th>Appareil</th><th>Type</th><th>Famille</th><th>Sous</th><th>IP / Node-ID</th>${withState ? '<th>Action</th>' : ''}${del ? '<th></th>' : ''}</tr></thead><tbody>${list.map((x, k) => `<tr class="${withState ? 'el-' + x.etat : ''}">
    <td>${ren === k ? `<div class="inp text" style="min-width:150px"><input id="hwRenIn" value="${esc(x.nom)}" autocomplete="off" aria-label="Nouveau nom"></div><div class="el-sub"><button class="btn primary" id="hwRenOk">OK</button> <button class="btn ghost" id="hwRenNo">Annuler</button></div>` : `<b>${esc(x.nom)}</b>`}${x.desc ? `<div class="el-sub">${esc(x.desc)}</div>` : ''}${x.src === 'manuel' ? '<div class="el-sub">ajouté à la main</div>' : x.nomFixe ? `<div class="el-sub">renommé ici${x.dossier && hwName(x.dossier) !== x.nom ? ' · dossier : ' + esc(x.dossier) : ''}</div>` : x.dossier && !/\{dossier\}/i.test(hwNomAuto(x.type)) && hwName(x.dossier) !== x.nom ? `<div class="el-sub">nom du catalogue · dossier : ${esc(x.dossier)}</div>` : ''}</td>
    <td>${esc(x.type)}${!hwCat()[x.type] ? ` <span class="el-warn">hors catalogue</span> <button class="btn ghost" data-hwcat="${esc(x.type)}">Ajouter au catalogue</button>` : ''}</td><td>${esc(HW_FAM(x.type))}</td><td>${esc(x.parent || '')}</td>
    <td>${esc(x.ip || (x.nodeId != null ? 'Node-ID ' + x.nodeId : ''))}</td>
    ${withState ? `<td>${x.etat === 'nouveau' ? '<b>Nouveau</b>' : x.etat === 'maj' ? 'Modifié' : '<span class="el-sub">Inchangé</span>'}</td>` : ''}
    ${del ? `<td class="hwact">${ren === k ? '' : `<button class="btn ghost" data-hwren="${k}" title="Nom de l’appareil dans Machine Expert, pour ce projet">Renommer</button>`}${x.src === 'manuel' ? ` <button class="btn ghost" data-hwdel="${k}">Retirer</button>` : ''}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
}
function hwPanel() {
  const cur = curProj(), L = cur.materiel || [], heads = L.filter(x => x.type === 'TM5NS31').map(x => x.nom);
  const f = S.hwForm || (S.hwForm = { nom: '', type: 'TM5SDI12D', val: '', parent: heads[heads.length - 1] || '' });
  const cat = hwCat(), isTm5 = sousTete(cat[f.type]?.parent);
  const nAx = pAxes().filter(a => a.gamme).length;
  return `<div class="pform elecform"><div class="memsg"><b>Matériel du projet</b> : ${L.length} appareil${L.length > 1 ? 's' : ''} que le script crée dans l’arbre de Machine Expert (« Sous » = le parent dans l’arbre), repris du dossier élec ou ajoutés ici. ${nAx ? `Les variateurs DRV_, cartes IO_ et codeurs LE_ de ${nAx} axe${nAx > 1 ? 's' : ''} brushless sont réglés dans l’onglet Brushless, les ATV320 dans l’onglet ATV320.` : ''} Un appareil du dossier se change en réimportant le dossier ; ceux ajoutés à la main restent après chaque import. <b>Renommer</b> change le nom de l’appareil dans Machine Expert pour ce projet (gardé à la réimportation) ; pour tous les projets, le modèle de nom se règle dans Catalogue › Matériel (« Nom dans l’automate »).</div>
    ${(() => { const m = busManquants(L); return m.length ? `<div class="warnline" style="margin:0;flex-basis:100%">Nœud de bus absent de la liste : ${m.map(esc).join(', ')} (des appareils sont déclarés dessous, le script ne pourra pas les créer). <button class="btn" id="hwFixBus" style="margin-left:8px">Ajouter ${m.map(esc).join(' et ')}</button></div>` : ''; })()}
    ${(() => { const m = tm5SansAlim(L); return m.length ? `<div class="warnline" style="margin:0;flex-basis:100%">Tête${m.length > 1 ? 's' : ''} de bus TM5 sans carte TM5SPS3 (PS3) en premier : ${m.map(esc).join(', ')}. Chaque îlot TM5 commence par sa PS3, qui alimente la tête et le bus TM5 (les PS1 / PS2 créent un segment plus loin dans l’îlot). <button class="btn" id="hwFixAlim" style="margin-left:8px">Ajouter les PS3</button></div>` : ''; })()}
    ${L.length ? hwTable(L, false, true) : '<div class="memsg">Aucun matériel : importe le dossier élec ou ajoute un appareil.</div>'}
    <span class="addlab">Ajouter un appareil à la main</span><div class="inp text" style="min-width:150px"><input id="hwNom" placeholder="Nom (ex. DI6_1)" value="${esc(f.nom)}" autocomplete="off" aria-label="Nom de l’appareil"></div>
    <select id="hwType" aria-label="Type">${Object.keys(cat).filter(t => !['Variateur Sercos', 'Carte IO', 'Codeur'].includes(HW_FAM(t))).sort().map(t => `<option ${t === f.type ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
    ${isTm5 ? `<select id="hwParent" aria-label="Tête de bus">${heads.length ? heads.map(h => `<option ${h === f.parent ? 'selected' : ''}>${esc(h)}</option>`).join('') : '<option value="">aucune tête TM5NS31</option>'}</select>` : ''}
    ${f.type === 'ATV320' || HW_FAM(f.type) === 'Ethernet/IP' ? `<div class="inp text" style="min-width:140px"><input id="hwVal" placeholder="${f.type === 'ATV320' ? 'Node-ID' : 'Adresse IP'}" value="${esc(f.val)}" autocomplete="off"></div>` : ''}
    <button class="btn primary" id="hwAdd">Ajouter</button><button class="btn" id="hwClose">Fermer</button></div>`;
}
/* Les appareils ajoutés à la main reprennent leur place (après l'appareil qui les précédait, sinon en fin de leur bus) */
function mergeHw(elec, man) {
  const out = elec.slice();
  for (const x of man) {
    let at = out.findIndex(y => y.nom === x.apres);
    if (at < 0) out.forEach((y, k) => { if (y.nom === x.parent || y.parent === x.parent) at = k; });
    out.splice(at >= 0 ? at + 1 : out.length, 0, x);
  }
  return out;
}
async function hwSave(list, msg) {
  const cur = curProj();
  try { await writeDoc('projects', cur.id, { ...strip(cur), materiel: list }); setStatus(msg); onData(); }
  catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); }
}
const ELEC_CHARGE = { MC: 'convoyeur', MR: 'rotatif', MT: 'lineaire', MP: 'bielle' };
/* Repère du dossier élec sans le numéro de folio collé devant : 11M1 -> M1, 213M7A -> M7A, 15-MT1 -> MT1 */
const sansFolio = s => String(s ?? '').trim().replace(/^(?:F(?:olio)?\s*)?\d+\s*[-./:_ ]?\s*(?=[A-Za-z])/i, '');
function parseElec(sheets) {
  const key = Object.keys(sheets).find(k => nrmE(k) === 'liste actionneurs');
  if (!key) throw new Error('onglet « Liste actionneurs » introuvable dans ce fichier');
  const rows = sheets[key];
  const hi = rows.findIndex(r => r && r.some(v => nrmE(v) === 'reperes') && r.some(v => nrmE(v) === 'gamme'));
  if (hi < 0) throw new Error('en-têtes « Repères » et « Gamme » introuvables dans « Liste actionneurs »');
  const H = {}, used = new Set(); rows[hi].forEach((v, j) => { const k = nrmE(v); if (k && H[k] == null) H[k] = j; });
  const col = (r, ...names) => { for (const nm of names) { if (H[nm] != null) used.add(nm); const j = H[nm]; const v = j != null ? r[j] : null; if (v != null && String(v).trim() !== '' && String(v) !== '#N/A') return v; } return null; };
  const pos = v => { const x = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.')); return isFinite(x) && x > 0 ? x : null; };
  /* colonnes de la plaque des moteurs asynchrones, trouvées par leur titre (tolérant : « Puissance (kW) », « P kW », « Courant (A) », « In »…) */
  const hdr = re => Object.keys(H).find(k => re.test(k));
  const CM = { fab: hdr(/^(fabricant|marque|constructeur)/), p: hdr(/^(puissance|p ?\(kw\)|p ?\[kw\]|p kw|kw$|p$)/), iN: hdr(/^(courant|intensite|in ?\(a\)|in$|i nom|i ?\(a\))/), n: hdr(/^(vitesse|n ?\(tr|tr\/min|n$)/), u: hdr(/^(tension|u ?\(v\)|u$)/), poles: hdr(/^(poles|polarite|nb poles|nombre de poles)/) };
  const colM = (r, k) => CM[k] ? col(r, CM[k]) : null;
  const plaque = r => { const fab = String(colM(r, 'fab') || '').trim(), p = pos(colM(r, 'p')), iN = pos(colM(r, 'iN')), n = pos(colM(r, 'n')), u = String(colM(r, 'u') || '').trim(), po = pos(colM(r, 'poles')); return { ...(fab ? { fab } : {}), ...(p != null ? { p } : {}), ...(iN != null ? { iN } : {}), ...(n != null ? { n } : {}), ...(u ? { u } : {}), ...(po != null ? { poles: po } : {}) }; };
  const servo = [], autres = {}, asyn = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const gammeTxt = String(col(r, 'gamme') || '').trim(), gamme = gammeTxt.toUpperCase();
    if (nrmE(gammeTxt) === 'gamme') continue;   // ligne d'en-tête répétée (bloc brushless après le bloc asynchrone)
    const brut = String(col(r, 'reperes') || '').trim();
    let nom = sansFolio(brut);
    if (!nom) { const t = col(r, 'type'), n = col(r, 'n°'); if (t && n != null) nom = String(t).trim() + String(n).trim(); }
    if (!nom || !gamme) continue;
    const drv = String(col(r, 'reference') || '').trim(), motRef = String(col(r, 'references') || '').trim(), desc = String(col(r, 'nom') || col(r, 'designation') || '').trim();
    /* moteur sur ATV320 (asynchrone, BMP, tambour…) : géré comme un axe (moteur, réducteur, charge → HSP / LSP / ITH / limite de courant),
       et l'ATV320 va dans le matériel (CANopen). Gamme ATV320 mais variateur qui n'est pas un ATV (actionneur Linak…) : ignoré, signalé. */
    const estAtvG = /^ATV/i.test(gamme), estAtvD = /^ATV/i.test(drv);
    if (estAtvG && drv && !estAtvD) { autres[gammeTxt + ' sans ATV (' + drv + ')'] = (autres[gammeTxt + ' sans ATV (' + drv + ')'] || 0) + 1; continue; }
    if (estAtvG || estAtvD) {
      const pl = plaque(r);
      asyn.push({ nom, brut, gamme: /^ATV320/i.test(drv) || !estAtvG ? 'ATV320' : gamme, desc, ref: drv, moteurRef: motRef, bmp: true, ...pl });
      servo.push({ ligne: i + 1, ordre: servo.length + 1, nom, brut, desc, moteurRef: motRef, frein: /^o(ui)?$/i.test(String(col(r, 'frein') || '').trim()), gamme: 'BMP', variateur: drv, i: pos(col(r, 'i')), feed: pos(col(r, 'feed constant')), p: pl.p ?? null, fab: pl.fab || '' });
      continue;
    }
    if (!/^(LXM62|ILM62)/.test(gamme)) { autres[gammeTxt] = (autres[gammeTxt] || 0) + 1; asyn.push({ nom, brut, gamme, desc, ref: drv, moteurRef: motRef, ...plaque(r) }); continue; }
    servo.push({ ligne: i + 1, ordre: servo.length + 1, nom, brut, desc, moteurRef: motRef,
      frein: /^o(ui)?$/i.test(String(col(r, 'frein') || '').trim()), gamme: gamme.slice(0, 5), variateur: /^(LXM|ILM)/i.test(drv) ? drv : '', i: pos(col(r, 'i')), feed: pos(col(r, 'feed constant')) });
  }
  /* deux repères qui ne diffèrent que par le folio : on garde le repère complet pour les deux */
  const notes = [], ex = [];
  [servo, asyn].forEach(L => {
    const n = {}; L.forEach(x => { const k = nrmE(x.nom); n[k] = (n[k] || 0) + 1; });
    L.forEach(x => { if (n[nrmE(x.nom)] > 1 && x.brut) { notes.push(x.brut); x.nom = x.brut; } });
    L.forEach(x => { if (x.brut && x.brut !== x.nom && ex.length < 3) ex.push(x.brut + ' → ' + x.nom); });
  });
  const nf = servo.concat(asyn).filter(x => x.brut && x.brut !== x.nom).length;
  /* colonnes de « Liste actionneurs » que l'outil ne lit pas (titres seulement, pour savoir ce qu'on pourrait encore exploiter) */
  const inutilisees = Object.keys(H).filter(k => !used.has(k) && !Object.values(CM).includes(k)).map(k => String(rows[hi][H[k]]).trim());
  const plaques = Object.keys(CM).filter(k => CM[k]).map(k => String(rows[hi][H[CM[k]]]).trim());
  return { servo, autres, asyn, inutilisees, plaques, folio: nf ? 'numéro de folio retiré de ' + nf + ' repère' + (nf > 1 ? 's' : '') + ' (' + ex.join(', ') + (nf > 3 ? '…' : '') + ')' + (notes.length ? ' ; gardé pour ' + notes.join(', ') + ' (même repère sur deux folios)' : '') : '' };
}
const refKey = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
/* Fiche variateur dont la référence est le début de celle du dossier (ATV320U06N4C -> ATV320U06N4, LXM62DU60C21000 -> LXM62DU60) : la plus longue qui convient */
function driveOf(ref) {
  const R = refKey(ref); if (!R) return null;
  let best = null;
  S.drives.forEach(d => { const k = refKey(d.ref); if (k && R.startsWith(k) && (!best || k.length > refKey(best.ref).length)) best = d; });
  return best;
}
/* Moteur asynchrone du catalogue pour une référence du dossier : référence identique, sinon fiche dont la référence
   (avec sa puissance : « LS80L 0,75 kW ») est le début de celle du dossier (« LS80L 0,75kW 4P B5 ») */
const estAsync = m => m && m.typeMot === 'async';
function asyncMotorOf(ref) {
  const R = refKey(ref); if (!R) return null;
  const ex = S.motors.find(m => refKey(m.ref) === R); if (ex) return ex;
  const A = S.motors.filter(estAsync), kl = m => refKey(m.ref).length;
  let best = null;
  A.forEach(m => { const k = refKey(m.ref); if (k.length >= 4 && R.startsWith(k) && (!best || k.length > kl(best))) best = m; });
  if (best) return best;
  /* motoréducteur (« R37 DRN80M4/TF ») : la référence du moteur est au milieu */
  A.forEach(m => { const k = refKey(m.ref); if (k.length >= 6 && R.includes(k) && (!best || k.length > kl(best))) best = m; });
  if (best) return best;
  /* dossier sans la puissance (« LSES 80 LG ») : une seule fiche commence ainsi */
  const c = R.length >= 5 ? A.filter(m => refKey(m.ref).startsWith(R)) : [];
  return c.length === 1 ? c[0] : null;
}
/* Fiche moteur d'un ATV320 du projet : choisie à la main (moteurId), sinon retrouvée d'après la référence du dossier */
const atvMotorOf = x => (x.moteurId && S.motors.find(m => m.id === x.moteurId)) || asyncMotorOf(x.moteurRef) || null;
/* Tension réseau d'un ATV320 d'après sa référence : …N4 = 400 V triphasé, …M2 / …M3 = 230 V */
const atvTension = ref => /M[23]/.test(refKey(ref).replace(/^ATV320[A-Z]\d{2,3}/, '')) ? 230 : 400;
/* Plaque moteur à entrer dans l'ATV320 (menu [Contrôle moteur] drC-, réglée en Modbus chez BFR) :
   NPR puissance, UNS tension, NCR courant, FRS fréquence, NSP vitesse, COS, ITH = NCR. x = appareil du projet, m = fiche moteur, d = fiche ATV320 */
function atvPlaque(x, m, d) {
  const C = [], R = { m, d };
  if (!m) return R;
  const uAtv = atvTension(x.ref || (d && d.ref) || ''), tens = String(m.tension || '');
  const volts = (tens.match(/\d{3}/g) || []).map(Number).filter(v => v >= 100 && v <= 700);
  const uns = volts.length === 1 ? volts[0] : uAtv;
  const i400 = num(m.i0), i230 = num(m.iNom230), iAt = volts.length === 1 ? volts[0] : 400;   // tension à laquelle IN (i0) est donné
  let ncr = null, convI = '';
  if (uns === 230 && i230 != null) ncr = i230;
  else if (i400 != null) { if (iAt === uns) ncr = i400; else { ncr = uns < iAt ? i400 * Math.sqrt(3) : i400 / Math.sqrt(3); convI = 'IN converti de ' + iAt + ' V à ' + uns + ' V (' + (uns < iAt ? '× √3' : '÷ √3') + ') : vérifie la plaque'; } }
  const frs = num(m.freq) ?? 50, nsp = num(m.nNom), cos = num(m.cosPhi);
  const npr = num(m.pNom) ?? (num(m.m0) != null && nsp ? num(m.m0) * nsp * 2 * Math.PI / 60 / 1000 : null);
  const paires = num(m.paires) ?? (nsp && frs ? Math.max(1, Math.round(60 * frs / nsp)) : null);
  Object.assign(R, { uns, ncr, frs, nsp, cos, npr, ith: ncr, paires, convI, uAtv });
  if (volts.length === 1 && volts[0] !== uAtv) C.push(['crit', 'Moteur ' + volts[0] + ' V seulement, ATV320 sur réseau ' + uAtv + ' V : vérifie le couplage / la référence']);
  if (volts.length >= 2 && !volts.includes(uAtv)) C.push(['crit', 'Moteur ' + volts.join('/') + ' V, ATV320 sur réseau ' + uAtv + ' V : vérifie la référence']);
  /* ce que le dossier élec indique, comparé à la fiche constructeur : un écart = erreur dans le dossier ou mauvaise fiche */
  const ecart = (a, b, tol) => a != null && b != null && Math.abs(a - b) > tol * Math.max(Math.abs(a), Math.abs(b));
  const ec = [];
  if (ecart(num(x.moteurP), npr, 0.06)) ec.push('puissance ' + fmt(num(x.moteurP), 2) + ' kW (dossier) / ' + fmt(npr, 2) + ' kW (fiche)');
  if (ecart(num(x.moteurI), ncr, 0.12)) ec.push('courant ' + fmt(num(x.moteurI), 2) + ' A (dossier) / ' + fmt(ncr, 2) + ' A (fiche)');
  if (ecart(num(x.moteurN), nsp, 0.04)) ec.push('vitesse ' + fmt(num(x.moteurN), 0) + ' (dossier) / ' + fmt(nsp, 0) + ' tr/min (fiche)');
  if (ec.length) C.push(['warn', 'Écart dossier élec / fiche constructeur : ' + ec.join(' ; ') + '. La fiche fait foi : vérifie le dossier ou le rattachement']);
  if (convI) C.push(['warn', convI]);
  if (npr == null) C.push(['warn', 'Puissance nominale absente de la fiche (NPR)']);
  if (ncr == null) C.push(['warn', 'Courant nominal absent de la fiche (NCR / ITH)']);
  if (nsp == null) C.push(['warn', 'Vitesse nominale absente de la fiche (NSP)']);
  if (cos == null) C.push(['info', 'cos φ absent de la fiche (COS) : à lire sur la plaque']);
  if (d) {
    const inD = num(d.iNom), pD = num(d.puissance);
    if (ncr != null && inD != null && ncr > inD) C.push(['crit', 'IN moteur ' + fmt(ncr, 2) + ' A > In ATV320 ' + fmt(inD, 1) + ' A (' + d.ref + ') : variateur trop petit']);
    else if (ncr != null && inD != null && ncr > inD * 0.9) C.push(['info', 'IN moteur proche du In de l’ATV320 (' + fmt(ncr, 2) + ' / ' + fmt(inD, 1) + ' A)']);
    if (npr != null && pD != null && npr > pD * 1.05) C.push(['warn', 'Puissance moteur ' + fmt(npr, 2) + ' kW > ATV320 ' + fmt(pD, 2) + ' kW']);
  } else if (x.ref) C.push(['info', 'ATV320 ' + x.ref + ' absent du catalogue Variateurs : pas de contrôle In / puissance']);
  R.checks = C;
  return R;
}
/* Texte de la plaque d'un ATV320, pour la liste des paramètres Modbus */
const plaqueTxt = (x, P) => !P || !P.m ? '' : [x.nom + (x.nodeId != null ? ' (Node-ID ' + x.nodeId + ')' : '') + ' · ' + P.m.ref,
  'NPR ' + (P.npr != null ? fmt(P.npr, 2) + ' kW' : '?'), 'UNS ' + P.uns + ' V', 'NCR ' + (P.ncr != null ? fmt(P.ncr, 2) + ' A' : '?'), 'FRS ' + fmt(P.frs, 0) + ' Hz',
  'NSP ' + (P.nsp != null ? fmt(P.nsp, 0) + ' tr/min' : '?'), 'COS ' + (P.cos != null ? fmt(P.cos, 2) : '?'), 'ITH ' + (P.ith != null ? fmt(P.ith, 2) + ' A' : '?')].join(' | ');
/* ref = référence moteur du dossier ; frein = colonne Frein ; p = puissance du dossier en kW (pour départager les fiches qui commencent pareil) */
/* drv = référence du variateur du dossier : sa tension réseau (ATV320…N4 = 400 V, M2 / M3 = 230 V) départage les bobinages d'une même fiche */
function matchMotor(ref, frein, p, drv) {
  const R = refKey(ref);
  if (!R) return { m: null, why: 'pas de référence moteur dans le dossier' };
  const exact = S.motors.find(m => refKey(m.ref) === R); if (exact) return { m: exact };
  const mm = /^(SH3\d{4}[A-Z]|ILM\d{4}[A-Z]|BMH\d{4}[A-Z]|BSH\d{4}[A-Z]|BMP\d{4}[A-Z])/.exec(R);
  if (!mm) {
    /* asynchrone ou tambour : fiche dont la référence est le début de celle du dossier (DRN80M4/TF), contenue dedans (R37 DRN80M4), ou qui commence par celle du dossier (DM0080 → DM 0080 …) */
    const am = asyncMotorOf(ref); if (am) return { m: am };
    let cand = R.length >= 4 ? S.motors.filter(m => refKey(m.ref).startsWith(R)) : [];
    if (cand.length > 1) {
      const crit = [];
      /* 1. tension réseau du variateur : on écarte les fiches données pour une autre tension (bobinage 230 V sur un ATV320 N4…) */
      if (drv && /^ATV/i.test(drv)) { const u = atvTension(drv), c2 = cand.filter(m => { const v = (String(m.tension || '').match(/\d{3}/g) || []).map(Number); return !v.length || v.includes(u); }); if (c2.length && c2.length < cand.length) { cand = c2; crit.push(u + ' V (' + drv + ')'); } }
      /* 2. puissance du dossier */
      const pk = num(p), exactP = pk ? cand.filter(m => num(m.pNom) != null && Math.abs(num(m.pNom) - pk) <= pk * 0.02) : [];
      const proches = exactP.length ? exactP : (pk ? cand.filter(m => num(m.pNom) != null && Math.abs(num(m.pNom) - pk) <= Math.max(0.012, pk * 0.12)) : []);
      if (pk && proches.length && proches.length < cand.length) { cand = proches; crit.push(fmt(pk, 3) + ' kW'); }
      if (cand.length === 1) return { m: cand[0], why: 'retenu d’après ' + crit.join(' et ') + ' parmi les fiches ' + ref };
      /* 3. il reste une seule fiche asynchrone face à des synchrones (tambour Interroll) : l'asynchrone est retenu, le synchrone se choisit dans l'axe */
      const asy = cand.filter(m => m.typeMot === 'async');
      if (asy.length === 1) return { m: asy[0], why: 'asynchrone retenu' + (crit.length ? ' (' + crit.join(', ') + ')' : '') + ' ; variante synchrone possible : ' + cand.filter(m => m !== asy[0]).map(m => m.ref).join(' / ') + ' (à changer dans l’axe)' };
      const L = cand.slice(0, 6).map(m => m.ref).join(' / ');
      return { m: null, cand: cand.length, why: cand.length + ' fiches ' + ref + (crit.length ? ' en ' + crit.join(' / ') : '') + ' : à choisir (' + L + (cand.length > 6 ? '…' : '') + ')' };
    }
    return { m: null, why: 'référence non reconnue : moteur à choisir' };
  }
  const c = S.motors.filter(m => refKey(m.ref).startsWith(mm[1]));
  if (!c.length) return { m: null, why: mm[1] + ' absent de la base moteurs' };
  const brk = m => m.frein === true || /frein/i.test(m.ref || '');
  const same = c.filter(m => brk(m) === frein);
  if (same.length) return { m: same[0] };
  return { m: c[0], why: frein ? 'version avec frein absente de la base : inertie sans frein, à vérifier' : 'seule la version avec frein est dans la base' };
}
const ELEC_LAB = { nom: 'nom sans folio', desc: 'désignation', gamme: 'type de variateur', variateur: 'variateur', moteurRef: 'réf. moteur', moteurId: 'moteur', feed: 'FeedConstant', ordre: 'ordre Sercos' };
function elecDiff(P, file) {
  const ex = pAxes(), byName = new Map(ex.map(a => [nrmE(a.nom), a]));
  /* axe déjà créé avec le folio devant (ancien import) : retrouvé et renommé sans le folio */
  const byFolio = new Map(ex.filter(a => sansFolio(a.nom) !== String(a.nom).trim()).map(a => [nrmE(sansFolio(a.nom)), a]));
  const rows = P.servo.map(s => {
    const mt = matchMotor(s.moteurRef, s.frein, s.p, s.variateur), a = byName.get(nrmE(s.nom)) || byFolio.get(nrmE(s.nom));
    const want = { desc: s.desc, gamme: s.gamme, variateur: s.variateur, moteurRef: s.moteurRef, ordre: s.ordre };
    if (a && nrmE(a.nom) !== nrmE(s.nom)) want.nom = s.nom;
    if (mt.m) want.moteurId = mt.m.id;
    if (s.feed) want.feed = s.feed;
    const ch = [];
    if (a) for (const [k, v] of Object.entries(want)) { if (k === 'feed' && num(a.feed) != null) continue; if (String(a[k] ?? '') !== String(v ?? '')) ch.push(k); }
    const etat = !a ? 'nouveau' : ch.length ? 'maj' : 'ok';
    return { ...s, mt, a, want, etat, ch, on: etat !== 'ok', typeCharge: s.gamme === 'BMP' ? 'convoyeur' : (ELEC_CHARGE[(s.nom.match(/^[A-Z]+/i) || [''])[0].toUpperCase()] || 'lineaire') };
  });
  const pris = new Set(rows.filter(r => r.a).map(r => r.a.id));
  return { file, rows, absents: ex.filter(a => !pris.has(a.id)).map(a => a.nom), autres: P.autres, folio: P.folio };
}
const chargeLabel = k => ((AXIS_GROUPS.flatMap(g => g.f).find(f => f.k === 'typeCharge')?.o || []).find(o => o[0] === k) || [k, k])[1].replace(/ \(.*\)$/, '');
/* Moteurs asynchrones des ATV320 du dossier : une ligne par référence, avec la fiche du catalogue si elle existe */
function elecFiches(asyn) {
  const by = new Map();
  asyn.filter(a => /^ATV320/i.test(a.gamme) && a.moteurRef).forEach(a => {
    const k = refKey(a.moteurRef); if (!k) return;
    if (!by.has(k)) { const mt = matchMotor(a.moteurRef, false, a.p, a.ref); by.set(k, { ref: a.moteurRef, fab: a.fab || '', p: a.p ?? null, iN: a.iN ?? null, n: a.n ?? null, u: a.u || '', poles: a.poles ?? null, noms: [], fiche: mt.m, cand: !mt.m && mt.cand ? mt.why : '' }); }
    const f = by.get(k); f.noms.push(a.nom);
    ['fab', 'u'].forEach(q => { if (!f[q] && a[q]) f[q] = a[q]; }); ['p', 'iN', 'n', 'poles'].forEach(q => { if (f[q] == null && a[q] != null) f[q] = a[q]; });
  });
  return [...by.values()];
}
/* Fiche moteur asynchrone créée depuis le dossier élec (données de la plaque présentes dans le dossier ; le reste se complète dans le catalogue) */
/* Le dossier élec ne fournit JAMAIS les données constructeur (il peut se tromper) : la fiche ne reprend que la référence
   et le fabricant, les valeurs de la plaque se saisissent depuis le catalogue constructeur. Ce que le dossier indique sert
   seulement de contrôle (écart signalé dans l'onglet ATV320). */
function ficheAsync(f, file) {
  const serie = (f.fab ? f.fab + ' ' : '') + (String(f.ref).match(/^[A-Za-z]{2,5}/)?.[0]?.toUpperCase() || 'asynchrones');
  return { ref: String(f.ref).trim(), typeMot: 'async', serie, ...(f.fab ? { marque: f.fab } : {}), freq: 50,
    notes: 'Fiche créée à l’import du dossier élec' + (file ? ' « ' + file + ' »' : '') + ' (' + f.noms.join(', ') + ') : référence et fabricant seulement. Puissance, tension, IN, vitesse, cos φ, rendement : à saisir depuis le catalogue constructeur ou la plaque, jamais depuis le dossier.', source: 'dossier élec' };
}
function elecPanel() {
  const E = S.elec, nOn = E.rows.filter(r => r.on && r.etat !== 'ok').length;
  const autres = Object.entries(E.autres).map(([g, n]) => n + ' ' + g).join(', ');
  const tr = E.rows.map((r, k) => `<tr class="el-${r.etat}"><td><input type="checkbox" data-elec="${k}" ${r.on ? 'checked' : ''} ${r.etat === 'ok' ? 'disabled' : ''} aria-label="${esc(r.nom)}"></td>
    <td><b>${esc(r.nom)}</b></td><td>${esc(r.desc)}</td>
    <td>${r.mt.m ? esc(r.mt.m.ref) : '<span class="el-warn">à choisir</span>'}<div class="el-sub">${esc(r.moteurRef || '—')}${r.frein ? ' · frein' : ''}${r.mt.why ? ' · ' + esc(r.mt.why) : ''}</div></td>
    <td>${esc(r.variateur || r.gamme)}</td>
    <td>${r.a ? '<span class="el-sub">inchangé</span>' : esc(chargeLabel(r.typeCharge))}</td>
    <td>${r.etat === 'nouveau' ? '<b>Nouvel axe</b>' : r.etat === 'maj' ? 'Mise à jour : ' + r.ch.map(c => ELEC_LAB[c] || c).join(', ') : '<span class="el-sub">Déjà à jour</span>'}</td></tr>`).join('');
  const nNew = E.rows.filter(r => r.etat === 'nouveau').length, nMaj = E.rows.filter(r => r.etat === 'maj').length, nAtv = Object.entries(E.autres).filter(([g]) => /ATV/i.test(g)).reduce((a, [, n]) => a + n, 0);
  const autresTxt = Object.entries(E.autres).filter(([g]) => !/ATV/i.test(g)).map(([g, n]) => n + ' ' + g).join(', ');
  const fiches = E.fiches || [], nFiches = fiches.filter(x => !x.fiche && !x.cand).length, ficheOn = E.ficheOn && nFiches > 0;
  const canApply = nOn || (E.hw && E.hw.change && E.hwOn) || ficheOn;
  const btns = `<button class="btn primary" data-elecok ${canApply ? '' : 'disabled'}>${canApply ? 'Appliquer' + (nOn ? ' · ' + nOn + ' axe' + (nOn > 1 ? 's' : '') : '') + (E.hw && E.hw.change && E.hwOn ? ' · matériel' : '') + (ficheOn ? ' · ' + nFiches + ' fiche' + (nFiches > 1 ? 's' : '') + ' moteur' : '') : 'Rien à faire'}</button><button class="btn" data-eleccancel>Fermer</button>`;
  const D = E.diag || { onglets: [], inutilisees: [], plaques: [] };
  const ecartF = f => { const m = f.fiche; if (!m) return []; const e = (a, b, t) => a != null && b != null && Math.abs(a - b) > t * Math.max(a, b); const out = [];
    if (e(f.p, num(m.pNom), 0.06)) out.push('puissance'); if (e(f.iN, num(m.i0), 0.12)) out.push('courant'); if (e(f.n, num(m.nNom), 0.04)) out.push('vitesse'); return out; };
  const ficheRows = fiches.map(f => { const m = f.fiche, ec = ecartF(f); return `<tr class="el-${m ? 'ok' : 'nouveau'}"><td><b>${esc(f.ref)}</b>${f.fab ? `<div class="el-sub">${esc(f.fab)}</div>` : ''}</td>
    <td>${m ? esc(m.ref) + `<div class="el-sub">${[m.typeMot === 'async' ? 'asynchrone' : 'synchrone', num(m.pNom) != null ? fmt(num(m.pNom), 3) + ' kW' : '', num(m.i0) != null ? 'IN ' + fmt(num(m.i0), 2) + ' A' : '', num(m.nNom) != null ? fmt(num(m.nNom), 0) + ' tr/min' : '', m.tension ? esc(m.tension) : ''].filter(Boolean).join(' · ') || 'fiche à compléter'}${refKey(m.ref) !== refKey(f.ref) ? ' · rattachée par la référence' : ''}</div>` : f.cand ? `<span class="el-warn">à choisir dans l’axe</span><div class="el-sub">${esc(f.cand)}</div>` : (ficheOn ? '<b>À créer</b> <span class="el-sub">(référence et fabricant seulement)</span>' : '<span class="el-warn">absente du catalogue</span>')}</td>
    <td>${[f.p != null ? fmt(f.p, 2) + ' kW' : '', f.iN != null ? 'IN ' + fmt(f.iN, 2) + ' A' : '', f.n != null ? fmt(f.n, 0) + ' tr/min' : '', f.u ? esc(f.u) : '', f.poles != null ? f.poles + ' pôles' : ''].filter(Boolean).join(' · ') || '<span class="el-sub">—</span>'}${ec.length ? `<div class="el-warn">écart avec la fiche : ${ec.join(', ')}</div>` : m && (f.p != null || f.iN != null || f.n != null) ? '<div class="el-sub">cohérent avec la fiche</div>' : ''}</td>
    <td>${f.noms.map(esc).join(', ')}</td></tr>`; }).join('');
  const fichesHtml = fiches.length ? `<h3 class="elech">Moteurs sur ATV320 <span class="el-sub">chaque moteur sur ATV320 est un axe (tableau Axes) ; le dossier donne la référence, la fiche du catalogue Moteurs donne les données constructeur (plaque de l’ATV320 : NPR, UNS, NCR, FRS, NSP, COS, ITH ; HSP / LSP / limite de courant d’après l’axe)</span></h3>
    <div class="tblwrap elecwrap"><table><thead><tr><th>Moteur (dossier)</th><th>Fiche catalogue (fait foi)</th><th>Indiqué dans le dossier <span class="el-sub" style="text-transform:none">contrôle seulement${D.plaques.length ? ' · colonnes ' + D.plaques.map(esc).join(', ') : ''}</span></th><th>ATV320</th></tr></thead><tbody>${ficheRows}</tbody></table></div>

    ${nFiches ? `<label class="chk"><input type="checkbox" id="elecFiches" ${E.ficheOn ? 'checked' : ''}> ${nFiches > 1 ? 'Créer les ' + nFiches + ' fiches absentes' : 'Créer la fiche absente'} dans Catalogue › Moteurs (référence et fabricant seulement : les données constructeur se saisissent depuis le catalogue ou la plaque, jamais depuis le dossier)</label>` : '<div class="memsg">Toutes les références ont leur fiche : la plaque de chaque ATV320 est dans l’onglet ATV320.</div>'}` : '';
  const diagHtml = D.onglets.length || D.inutilisees.length ? `<details class="tabmore" style="flex-basis:100%"><summary>Ce que le dossier contient d’autre (non lu par l’outil)</summary><ul>
    ${D.onglets.length ? `<li>Onglets non lus : ${D.onglets.map(esc).join(', ')}.</li>` : ''}
    ${D.inutilisees.length ? `<li>Colonnes de « Liste actionneurs » non exploitées : ${D.inutilisees.map(esc).join(', ')}.</li>` : ''}
    <li class="el-sub">Seuls les titres sont affichés ici, rien n’est enregistré. Si une de ces colonnes ou un de ces onglets serait utile (codeur, réducteur, adresse CANopen, E/S…), c’est ce qu’il faut ajouter à l’import. Les données constructeur (plaques moteurs, variateurs) ne viennent jamais du dossier : elles sont dans le catalogue de l’outil.</li></ul></details>` : '';
  return `<div class="pform elecform"><div class="elechead"><div><b>Dossier élec « ${esc(E.file)} »</b><div class="el-sub">Lu dans ce navigateur, ni enregistré ni envoyé. Seuls les axes (nom, désignation, moteur, variateur), le matériel (nom, type, IP, Node-ID) et, pour contrôle, ce que le dossier indique sur les moteurs asynchrones (fabricant, puissance, courant, vitesse, tension) sont gardés ; les données constructeur viennent du catalogue de l’outil.</div></div><div class="actions">${btns}</div></div>
    <div class="elecsum"><span><b>${E.rows.length}</b> axe${E.rows.length > 1 ? 's' : ''} brushless : ${nNew} nouveau${nNew > 1 ? 'x' : ''}, ${nMaj} à mettre à jour, ${E.rows.length - nNew - nMaj} déjà à jour</span>${E.hw ? `<span><b>${E.hw.rows.length}</b> appareil${E.hw.rows.length > 1 ? 's' : ''} : ${E.hw.n.nouveau} nouveau${E.hw.n.nouveau > 1 ? 'x' : ''}, ${E.hw.n.maj} modifié${E.hw.n.maj > 1 ? 's' : ''}, ${E.hw.n.retires} retiré${E.hw.n.retires > 1 ? 's' : ''}</span>` : ''}${nAtv ? `<span>${nAtv} ATV320 repris dans le matériel</span>` : ''}${autresTxt ? `<span>ignorés : ${esc(autresTxt)}</span>` : ''}</div>
    ${E.folio ? `<div class="memsg">Repères : ${esc(E.folio)}.</div>` : ''}
    <h3 class="elech">Axes</h3>
    <div class="tblwrap elecwrap"><table><thead><tr><th><input type="checkbox" id="elecAll" title="Tout cocher / décocher" aria-label="Tout cocher ou décocher" ${E.rows.some(r => r.etat !== 'ok' && !r.on) ? '' : 'checked'} ${E.rows.some(r => r.etat !== 'ok') ? '' : 'disabled'}></th><th>Axe</th><th>Désignation</th><th>Moteur</th><th>Variateur</th><th>Charge proposée</th><th>Action</th></tr></thead><tbody>${tr}</tbody></table></div>
    ${E.absents.length ? `<div class="memsg">Dans le projet mais pas dans le dossier : ${E.absents.map(esc).join(', ')} (rien n’est supprimé, un axe se retire dans l’onglet Axes).</div>` : ''}
    <div class="memsg">Après l’import : le réducteur, la charge et la vitesse du cycle restent à saisir dans chaque axe. Ce qui est déjà saisi n’est jamais écrasé.</div>
    ${E.hw ? `<h3 class="elech">Matériel <span class="el-sub">CAN et ATV320, alimentations, îlots TM5, Ethernet/IP · les DRV_, IO_ et LE_ viennent des axes</span></h3>
      ${E.hw.renommes && E.hw.renommes.length || E.hw.retires.length || E.hw.remplaces.length || E.hw.man.length || E.hwWarn.length ? `<ul class="eleclist">
      ${E.hw.renommes && E.hw.renommes.length ? `<li>Renommés sans le folio : ${E.hw.renommes.slice(0, 4).map(esc).join(', ')}${E.hw.renommes.length > 4 ? ' et ' + (E.hw.renommes.length - 4) + ' autre' + (E.hw.renommes.length > 5 ? 's' : '') : ''}.</li>` : ''}
      ${E.hw.retires.length ? `<li>Retirés du projet (plus dans le dossier) : ${E.hw.retires.map(esc).join(', ')}.</li>` : ''}${E.hw.remplaces.length ? `<li>Ajoutés à la main puis trouvés dans le dossier (remplacés) : ${E.hw.remplaces.map(esc).join(', ')}.</li>` : ''}${E.hw.man.length ? `<li>Gardés (ajoutés à la main) : ${E.hw.man.map(x => esc(x.nom)).join(', ')}.</li>` : ''}
      ${E.hwWarn.map(w => `<li class="el-warn">${esc(w)}</li>`).join('')}</ul>` : ''}
      ${hwTable(E.hw.rows, true)}
      <label class="chk"><input type="checkbox" id="elecHw" ${E.hwOn ? 'checked' : ''} ${E.hw.change ? '' : 'disabled'}> Mettre à jour le matériel du projet</label>` : ''}
    ${fichesHtml}${diagHtml}
    <div class="actions">${btns}</div></div>`;
}
/* Panneau d'import construit depuis les feuilles lues (gardées en mémoire le temps du panneau, jamais enregistrées) */
function elecBuild(sheets, file) {
  const P = parseElec(sheets);
  if (!P.servo.length && !P.asyn.length) throw new Error('aucun axe (LXM62, ILM62, ATV320) trouvé dans « Liste actionneurs »');
  const M = parseMateriel(sheets, P.asyn), hw = hwDiff(M.items), fiches = elecFiches(P.asyn);
  const lus = ['liste actionneurs', 'materiels'], diag = { onglets: (sheets._onglets || []).filter(n => !lus.includes(nrmE(n))), inutilisees: P.inutilisees || [], plaques: P.plaques || [] };
  const old = S.elec || {};
  S.elec = { ...elecDiff(P, file), hw, hwWarn: M.warn, hwOn: hw.change, fiches, ficheOn: old.sheets === sheets ? old.ficheOn : fiches.some(x => !x.fiche && !x.cand), diag, sheets, file };
}
async function readElecFile(f) {
  try {
    setStatus('Lecture du dossier élec…');
    const sheets = await xlsxSheets(await f.arrayBuffer(), ['Liste actionneurs', 'Matériels']);
    S.projForm = null; S.meForm = null; S.hwView = false; S.elec = null;
    elecBuild(sheets, f.name);
    setStatus(''); renderProj();
  } catch (e) { S.elec = null; setStatus('Dossier élec illisible : ' + (e.message || e), true); renderProj(); }
}
async function applyElec() {
  if (S.dirty) { setStatus('Enregistre ou annule l’axe en cours avant d’importer.', true); return; }
  const E = S.elec, todo = E.rows.filter(r => r.on && r.etat !== 'ok'); let n = 0, hwMsg = '';
  try {
    {
      const cur = curProj(), patch = {};
      if (E.hw && E.hw.change && E.hwOn) { patch.materiel = mergeHw(E.hw.rows.map(x => ({ ...hwClean(x), src: 'elec' })), E.hw.man); hwMsg = ' Matériel mis à jour (' + (E.hw.rows.length + E.hw.man.length) + ' appareils).'; }
      if (Object.keys(patch).length) await writeDoc('projects', cur.id, { ...strip(cur), ...patch });
    }
    /* fiches moteur absentes du catalogue : créées d'abord (référence + fabricant), puis rattachées aux axes qui portent cette référence */
    let nF = 0; const creees = new Map();
    if (E.ficheOn) for (const f of (E.fiches || []).filter(x => !x.fiche && !x.cand)) { if (asyncMotorOf(f.ref)) continue; const id = newId('motors'); await writeDoc('motors', id, ficheAsync(f, E.file)); creees.set(refKey(f.ref), id); nF++; }
    for (const r of todo) {
      const w = { ...r.want }; if (!w.moteurId && creees.has(refKey(r.moteurRef))) w.moteurId = creees.get(refKey(r.moteurRef));
      if (r.a) await writeDoc('axes', r.a.id, { ...strip(r.a), ...w });
      else await writeDoc('axes', newId('axes'), { nom: r.nom, ...w, ioCard: r.gamme === 'LXM62', typeCharge: r.typeCharge, marge: 80, tStop: 0.2, projetId: S.projId, source: 'dossier élec' });
      n++;
    }
    if (nF) hwMsg += ' ' + nF + ' fiche' + (nF > 1 ? 's' : '') + ' moteur asynchrone créée' + (nF > 1 ? 's' : '') + ' dans le catalogue (à compléter depuis la plaque).';
    S.elec = null; setStatus((n ? n + ' axe' + (n > 1 ? 's' : '') + ' créé' + (n > 1 ? 's' : '') + ' ou mis à jour depuis le dossier élec. Complète le réducteur et la charge de chacun.' : '') + hwMsg); onData();
  } catch (e) { setStatus('Import arrêté après ' + n + ' axe(s) : ' + (e.message || e.code), true); }
}
/* Bilan des axes : un tableau de tout le projet, à relire avant le script */
function bilanPanel() {
  const L = brushList(), BADGE2 = { ok: ['ok', 'OK'], warn: ['warn', 'À vérifier'], crit: ['crit', 'Alerte'], todo: ['todo', 'À compléter'] };
  const stOf = a => { const R = compute(a); const al = R.missing ? [] : R.checks.filter(c => c[0] === 'crit' || c[0] === 'warn'); return { R, al, st: R.missing ? 'todo' : al.some(c => c[0] === 'crit') ? 'crit' : al.length ? 'warn' : 'ok' }; };
  const rows = L.map(a => {
    const { R, al, st } = stOf(a), m = S.motors.find(x => x.id === a.moteurId), r = S.reducers.find(x => x.id === a.reducteurId);
    const g = R.missing ? null : gainsOf(a, R), [cls, lab] = BADGE2[st];
    const manq = R.missing ? ([!m ? 'moteur' : null, !r ? 'réducteur' : null].filter(Boolean).join(' et ') || R.why || 'fiche incomplète') : '';
    return `<tr class="bl-${st}"><td><button class="linkbtn" data-bilan="${esc(a.id)}">${esc(a.nom || 'Sans nom')}</button>${a.desc ? `<div class="el-sub">${esc(a.desc)}</div>` : ''}</td>
      <td class="mono">${esc(m ? m.ref : '—')}</td><td class="mono">${esc(r ? r.ref : '—')}${r && !R.missing ? `<div class="el-sub">i=${fmt(R.i, 2)} · T2B ${R.t2b ? fmt(R.t2b, 0) + ' Nm' : '?'}</div>` : ''}</td>
      <td class="n">${R.missing ? '' : fmt(R.ratioTot, 1)}</td><td class="n">${R.missing || R.pct == null ? '' : fmt(R.pct, 1) + ' %'}</td>
      <td class="n">${R.missing ? '' : (R.dec ? fmt(R.stl, 0) + ' ms' : '<span class="el-sub">vitesse ?</span>')}</td>
      <td class="n">${g ? fmt(g.vp, 1) + ' / ' + fmt(g.vi, 1) + (num(a.velPRetenu) != null ? '' : ' <span class="el-sub">prop.</span>') : ''}</td>
      <td><span class="tag ${cls}">${lab}</span>${R.missing ? `<div class="el-sub">${esc(manq)}</div>` : al.length ? `<div class="el-sub">${al.slice(0, 2).map(c => esc(c[1])).join('<br>')}${al.length > 2 ? '<br>…' : ''}</div>` : ''}${!R.missing && (R.acked || []).length ? `<div class="el-sub">${R.acked.length} attention${R.acked.length > 1 ? 's' : ''} acquittée${R.acked.length > 1 ? 's' : ''}</div>` : ''}</td></tr>`;
  }).join('');
  const n = { todo: 0, ok: 0, warn: 0, crit: 0 }; L.forEach(a => { n[stOf(a).st]++; });
  return `<div class="pform elecform"><div class="elechead"><div><b>Bilan des axes</b><div class="el-sub">${L.length} axe${L.length > 1 ? 's' : ''} : ${n.ok} OK · ${n.warn} à vérifier · ${n.crit} en alerte · ${n.todo} à compléter. Clique sur un axe pour l’ouvrir. Le script n’écrit que les axes réglés (OK, à vérifier ou en alerte).</div></div><div class="actions"><button class="btn" id="bilanClose">Fermer</button></div></div>
    <div class="tblwrap elecwrap" style="max-height:none"><table class="gtbl bilan"><thead><tr><th>Axe</th><th>Moteur</th><th>Réducteur</th><th class="n" title="Inertie de la charge ramenée au moteur ÷ (moteur + réducteur)">Rapport d’inertie</th><th class="n">UserCurrentLimit</th><th class="n" title="StopTimeLim, d’après la vitesse max du cycle et la durée d’arrêt">Arrêt</th><th class="n" title="Vel_P_Gain / Vel_I_Gain : retenus après essais, sinon proposés">Vel_P / Vel_I</th><th>État</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
/* Ligne d'avancement du projet : ce qui est réglable, ce qui reste à compléter */
function projLine(cur) {
  const A = pAxes(); if (!A.length) return '';
  const st = A.map(a => { const R = compute(a); return { a, ok: !R.missing, crit: !R.missing && R.checks.some(c => c[0] === 'crit') }; });
  const todo = st.filter(x => !x.ok).map(x => x.a.nom), crit = st.filter(x => x.crit).map(x => x.a.nom);
  const hw = A.filter(a => a.gamme === 'LXM62' || a.gamme === 'ILM62').length, nBmp = A.filter(a => a.gamme === 'BMP').length, atvs = (cur.materiel || []).filter(x => x.type === 'ATV320'), atv = atvs.length;
  const nodes = atvs.map(x => num(x.nodeId)).filter(x => x != null), dupN = [...new Set(nodes.filter((x, i) => nodes.indexOf(x) !== i))];
  const lst = (L, n = 6) => L.slice(0, n).join(', ') + (L.length > n ? ' et ' + (L.length - n) + ' autre' + (L.length - n > 1 ? 's' : '') : '');
  return `<div class="pline"><b>${A.length} axe${A.length > 1 ? 's' : ''}</b> · ${st.length - todo.length} réglé${st.length - todo.length > 1 ? 's' : ''}${todo.length ? ` · <span class="pl-todo">${todo.length} à compléter (moteur ou réducteur) : ${esc(lst(todo))}</span>` : ''}${crit.length ? ` · <span class="pl-todo">alerte sur ${esc(lst(crit))}</span>` : ''}${hw ? ` · ${hw} brushless dans le hardware` : ''}${atv ? ` · ${atv} ATV320${nBmp ? ' (' + nBmp + ' axe' + (nBmp > 1 ? 's' : '') + ')' : ''}` : ''}${dupN.length ? ` · <span class="pl-todo">Node-ID en double : ${dupN.join(', ')}</span>` : ''}</div>`;
}
function renderProj() {
  const b = $('#projbar'); if (!b) return;
  const cur = curProj(), done = cur?.statut === 'termine';
  const opts = (st, lab) => { const l = S.projects.filter(p => (p.statut === 'termine') === (st === 'termine')); return l.length ? `<optgroup label="${lab}">${l.map(p => `<option value="${esc(p.id)}" ${p.id === S.projId ? 'selected' : ''}>${esc(p.nom)}</option>`).join('')}</optgroup>` : ''; };
  const n = cur ? pAxes().length : 0;
  b.innerHTML = `<span class="lbl">Projet</span>${S.projects.length ? `<select id="projSel" aria-label="Projet">${opts('en cours', 'En cours')}${opts('termine', 'Terminés')}</select>` : '<span class="muted">Aucun projet</span>'}
    ${done ? '<span class="pill done">Terminé</span>' : ''}
    <button class="btn" id="projNew" title="Nouveau projet (une machine)">+ Projet</button>
    ${cur ? `<button class="btn ghost" id="projRen">Renommer</button><button class="btn ghost" id="projDone" title="${done ? 'Remettre le projet dans la liste « En cours »' : 'Classer le projet dans « Terminés » (rien n’est supprimé)'}">${done ? 'Rouvrir' : 'Terminer'}</button>` : ''}
    ${cur ? `<div class="pacts">
      ${!done ? '<button class="btn" id="projElec" title="Lit le dossier électrique (.xlsm) et crée ou met à jour les axes et le matériel. Le fichier n’est ni enregistré ni envoyé.">Importer le dossier élec</button><input type="file" id="elecFile" accept=".xlsm,.xlsx" hidden>' : ''}
      <button class="btn" id="projHw" title="Tout le matériel du projet : CAN et ATV320, alimentations, îlots TM5, Ethernet/IP">Matériel du projet${(cur.materiel || []).length ? ' (' + cur.materiel.length + ')' : ''}</button>
      ${pAxes().length ? `<button class="btn ${S.bilanView ? 'primary' : ''}" id="projBilan" title="Tous les axes du projet sur une page : moteur, réducteur, inertie, limite de courant, gains, alertes. À relire avant de générer le script">Bilan des axes</button>` : ''}
      <span class="sep"></span>
      ${pAxes().length && (S.dl || !S.db) ? '<button class="btn" id="projMe" title="Génère le script Python qui crée le hardware et écrit les réglages dans Machine Expert">Script Machine Expert</button><button class="btn" id="projExp" title="Classeur Excel : un onglet par axe avec les valeurs à saisir et les alertes">Exporter (Excel)</button>' : ''}
    </div>${projLine(cur)}` : ''}
    ${S.projForm ? `<div class="pform"><div class="inp text" style="flex:1;min-width:200px"><input id="pfNom" placeholder="Nom du projet (machine, client…)" value="${esc(S.projForm.nom)}" autocomplete="off"></div>
      ${S.projForm.mode === 'new' && cur && n ? `<label class="chk"><input type="checkbox" id="pfCopy" ${S.projForm.copy ? 'checked' : ''}> Copier les ${n} axes de « ${esc(cur.nom)} »</label>` : ''}
      <button class="btn primary" id="pfOk">${S.projForm.mode === 'new' ? 'Créer' : 'Renommer'}</button><button class="btn" id="pfCancel">Annuler</button></div>` : ''}
    ${S.meForm && cur ? (() => { const F = S.meForm, A = pAxes(), ok = A.filter(a => !compute(a).missing && a.gamme !== 'BMP').length, hw = A.filter(a => a.gamme === 'LXM62' || a.gamme === 'ILM62').length;
      return `<div class="pform meform"><div class="memsg"><b>Script Machine Expert</b> : un fichier Python à lancer dans le projet (Outils › Scripting › Exécuter). Il ne supprime jamais rien et demande confirmation avant chaque écriture. Le rapport est écrit dans Documents.</div>
      <div class="mesec"><div class="mesec-h"><label class="chk"><input type="checkbox" id="meHw" ${F.hw ? 'checked' : ''}> <b>1 · Hardware</b></label><span class="el-sub">${hw} axe${hw > 1 ? 's' : ''} brushless · ${(cur.materiel || []).length} appareil${(cur.materiel || []).length > 1 ? 's' : ''} du projet</span></div>
        <div class="mesec-b">Crée ce qui manque dans l’arbre : le matériel du projet, puis pour chaque axe le codeur LE_, le variateur DRV_ et la carte IO_. Écrit ensuite les réglages des onglets Brushless (modes IO) et ATV320 (Node-ID, Optional device, paramètres). Une fenêtre liste les appareils avant de commencer.</div></div>
      <div class="mesec"><div class="mesec-h"><b>2 · Réglages des axes</b><span class="el-sub">${ok} axe${ok > 1 ? 's' : ''} réglé${ok > 1 ? 's' : ''} sur ${A.length}${A.length - ok ? ' (les autres sont ignorés)' : ''}</span></div>
        <div class="mesec-b">Écrits dans le variateur DRV_ de chaque axe réglé. Avant chaque axe, une fenêtre montre les valeurs qui changent (ancien → nouveau) : Oui, Oui à tous, Non, Arrêter.</div>
        <div class="mechk"><label class="chk"><input type="checkbox" id="meMeca" ${F.meca ? 'checked' : ''}> Mécanique : FeedConstant, GearIn, GearOut, J_Load, J_Gear</label>
        <label class="chk"><input type="checkbox" id="meLim" ${F.lim ? 'checked' : ''}> Limite de courant : UserCurrentLimit</label>
        <label class="chk"><input type="checkbox" id="meStop" ${F.stop ? 'checked' : ''}> Arrêt d’urgence : DriveStopCurrentLimit, ControllerStopDec, ControllerStopJerk, StopTimeLim, UserDefinedStopMode</label>
        <label class="chk"><input type="checkbox" id="meGains" ${F.gains ? 'checked' : ''}> Gains Vel_P / Vel_I (valeurs retenues si notées, sinon proposées)</label></div></div>
      <div class="mesec"><div class="mesec-h"><label class="chk"><input type="checkbox" id="meListe" ${F.liste ? 'checked' : ''}> <b>3 · Liste de paramètres</b></label></div>
        <div class="mesec-b">Crée ou complète <b>ParameterList_Reglages</b> sous Application : tous les axes, une colonne par paramètre réglé, pour tout voir d’un coup. Rien n’y est retiré, l’ancienne version est sauvegardée.</div></div>
      <div class="mesec"><div class="mesec-h"><label class="chk"><input type="checkbox" id="meTraces" ${F.traces ? 'checked' : ''}> <b>4 · Traces des axes</b></label><span class="el-sub">tâche ${esc(TACHE_CAN(cur))}</span></div>
        <div class="mesec-b">Recrée les traces <b>TRC_Axes_MT / MC / MP / MR</b> sous Application (script traces validé) : pour chaque axe physique DRV_, 4 diagrammes — Vitesse (consigne + réel), Position (réel + consigne), Erreur de poursuite, Courant. Les traces existantes de ces noms sont remplacées ; une famille sans axe n’a pas de trace.</div></div>
      <div class="actions"><button class="btn primary" id="meOk">Générer le script</button><button class="btn" id="meCancel">Annuler</button></div></div>`; })() : ''}
    ${S.elec && cur ? elecPanel() : ''}
    ${S.hwView && cur && !S.elec && !S.meForm && !S.projForm ? hwPanel() : ''}
    ${S.bilanView && cur && !S.elec && !S.meForm && !S.projForm && !S.hwView ? bilanPanel() : ''}`;
  const sel = $('#projSel'); if (sel) sel.onchange = () => { if (S.dirty && !confirm_()) { sel.value = S.projId; return; } S.projId = sel.value; S.axisId = null; S.dirty = false; S.draft = null; S.bilanView = false; S.hwView = false; S.elec = null; S.meForm = null; try { localStorage.setItem('servo-proj', S.projId); } catch (e) {} onData(); };
  $('#projNew').onclick = () => { S.projForm = { mode: 'new', nom: '', copy: false }; renderProj(); $('#pfNom').focus(); };
  const rn = $('#projRen'); if (rn) rn.onclick = () => { S.projForm = { mode: 'ren', nom: cur.nom }; renderProj(); $('#pfNom').focus(); };
  const ex = $('#projExp'); if (ex) ex.onclick = () => exportProject();
  const ph = $('#projHw'); if (ph) ph.onclick = () => { S.hwView = !S.hwView; S.bilanView = false; S.elec = null; S.meForm = null; S.projForm = null; renderProj(); };
  const pb = $('#projBilan'); if (pb) pb.onclick = () => { S.bilanView = !S.bilanView; S.hwView = false; S.elec = null; S.meForm = null; S.projForm = null; renderProj(); };
  const bc = $('#bilanClose'); if (bc) bc.onclick = () => { S.bilanView = false; renderProj(); };
  document.querySelectorAll('[data-bilan]').forEach(b => { b.onclick = () => {
    const a = S.axes.find(x => x.id === b.dataset.bilan); if (!a) return;
    if (S.dirty && !(S.draft && S.draft.id === a.id)) { setStatus('Un axe a des modifications non enregistrées : enregistre-les ou annule-les d’abord.', true); return; }
    S.tab = 'axes'; S.axisId = a.id; if (!S.dirty) S.draft = { ...a }; S.bilanView = false; try { localStorage.setItem('servo-tab', 'axes'); } catch (e) {} render(); window.scrollTo({ top: 0 });
  }; });
  if (S.hwView && cur && $('#hwAdd')) {
    const f = S.hwForm, L = cur.materiel || [];
    $('#hwNom').oninput = e => { f.nom = e.target.value; };
    $('#hwType').onchange = e => { f.type = e.target.value; renderProj(); };
    const hp = $('#hwParent'); if (hp) hp.onchange = e => { f.parent = e.target.value; };
    const hv = $('#hwVal'); if (hv) hv.oninput = e => { f.val = e.target.value; };
    $('#hwClose').onclick = () => { S.hwView = false; renderProj(); };
    const fb = $('#hwFixBus'); if (fb) fb.onclick = () => { const r = busCompleter(L); hwSave(r.out, r.ajoutes.join(', ') + ' ajouté' + (r.ajoutes.length > 1 ? 's' : '') + ' : le script créera le bus avant ses appareils.'); };
    const fx = $('#hwFixAlim'); if (fx) fx.onclick = () => { const w = []; const nl = tm5Alims(L.map(x => ({ ...x })), w).map(x => x.auto && !x.src ? { ...x, src: 'manuel', apres: x.parent } : x); hwSave(nl, w.join(' · ') || 'Alimentations en place.'); };
    document.querySelectorAll('[data-hwdel]').forEach(b => { b.onclick = () => { const x = L[+b.dataset.hwdel]; hwSave(L.filter((_, k) => k !== +b.dataset.hwdel), '« ' + x.nom + ' » retiré du matériel.'); }; });
    document.querySelectorAll('[data-hwren]').forEach(b => { b.onclick = () => { S.hwRen = +b.dataset.hwren; renderProj(); const i = $('#hwRenIn'); if (i) { i.focus(); i.select(); } }; });
    const rn = $('#hwRenNo'); if (rn) rn.onclick = () => { S.hwRen = null; renderProj(); };
    const ro = $('#hwRenOk'), ri = $('#hwRenIn');
    if (ro && ri) {
      const ok = () => {
        const x = L[S.hwRen], nom = hwName(ri.value); if (!x) return;
        if (!nom) { setStatus('Donne un nom à l’appareil.', true); return; }
        if (nom === x.nom) { S.hwRen = null; renderProj(); return; }
        if (L.some(y => y.nom === nom) || pAxes().some(a => ['DRV_', 'IO_', 'LE_'].some(p => p + a.nom === nom))) { setStatus('« ' + nom + ' » existe déjà.', true); return; }
        const old = x.nom, nl = L.map(y => { const z = { ...y }; if (z.parent === old) z.parent = nom; if (z.apres === old) z.apres = nom; return z; });
        nl[S.hwRen] = { ...nl[S.hwRen], nom, ...(x.src === 'manuel' ? {} : { nomFixe: true }) };
        S.hwRen = null;
        hwSave(nl, '« ' + old + ' » renommé « ' + nom + ' » pour ce projet' + (nl.some(y => y.parent === nom) ? ' (et ses modules rattachés)' : '') + '. Dans Machine Expert, un appareil déjà présent sous l’ancien nom (même référence) est reconnu par le script.');
      };
      ro.onclick = ok; ri.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); ok(); } if (e.key === 'Escape') { S.hwRen = null; renderProj(); } };
    }
    $('#hwAdd').onclick = () => {
      const nom = hwName(f.nom); if (!nom) { setStatus('Donne un nom à l’appareil.', true); return; }
      if (L.some(x => x.nom === nom) || pAxes().some(a => 'DRV_' + a.nom === nom)) { setStatus('« ' + nom + ' » existe déjà.', true); return; }
      const c = hwCat()[f.type], isTm5 = sousTete(c?.parent);
      const x = { nom, type: f.type, parent: isTm5 ? (f.parent || 'TM5NS31 ?') : (c?.parent || '?'), src: 'manuel' };
      if (f.type === 'ATV320') { const id = parseInt(f.val, 10); if (!(id > 0)) { setStatus('Donne le Node-ID de l’ATV320.', true); return; } x.nodeId = id; }
      else if (HW_FAM(f.type) === 'Ethernet/IP' && f.val) x.ip = f.val.trim();
      const anc = isTm5 ? f.parent : x.parent; let at = -1;
      L.forEach((y, k) => { if (y.nom === anc || y.parent === anc) at = k; });
      /* ne pas couper l'îlot du voisin : sauter ses enfants (ex. une nouvelle tête après la tête précédente ET ses modules) */
      if (at >= 0) { const bloc = new Set([L[at].nom]); while (at + 1 < L.length && bloc.has(L[at + 1].parent)) { at++; bloc.add(L[at].nom); } }
      if (at >= 0) x.apres = L[at].nom;
      let nl = L.slice(); if (at >= 0) nl.splice(at + 1, 0, x); else nl.push(x);
      const rb = busCompleter(nl); nl = rb.out;
      S.hwForm = { ...f, nom: '', val: '' };
      if (f.type === 'TM5NS31') {
        const t = ALIM_TM5_TYPE(), kh = nl.filter(y => y.type === 'TM5NS31').length, pn = hwUnique(hwNommer(t, { n: nl.filter(estAlimTm5).length + 1, ilot: kh }), new Set(nl.map(y => y.nom)));
        nl.splice(nl.indexOf(x) + 1, 0, { nom: pn, type: t, parent: nom, src: 'manuel', apres: nom, auto: true });
        hwSave(nl, '« ' + nom + ' » ajouté sous ' + x.parent + ', avec sa carte d’alimentation « ' + pn + ' » (' + t + ').'); return;
      }
      hwSave(nl, '« ' + nom + ' » ajouté sous ' + x.parent + (rb.ajoutes.length ? ', avec ' + rb.ajoutes.join(' et ') : '') + '.');
    };
  }
  document.querySelectorAll('[data-hwcat]').forEach(b => { b.onclick = () => { const t = b.dataset.hwcat, tm5 = /^TM5/i.test(t); S.lib.hwtypes = { ref: t, serie: tm5 ? 'Module TM5' : 'Autre', devType: tm5 ? 72 : null, devVer: tm5 ? '1.56.15.2' : '', parent: tm5 ? 'TM5NS31' : '' }; S.tab = 'hwtypes'; render(); setStatus('Complète la fiche (identifiant et version du DeviceID), enregistre, puis réimporte le dossier élec.'); }; });
  const pe = $('#projElec'), fe = $('#elecFile');
  if (pe && fe) { pe.onclick = () => fe.click(); fe.onchange = () => { const f = fe.files[0]; fe.value = ''; if (f) readElecFile(f); }; }
  if (S.elec && $('[data-elecok]')) {
    document.querySelectorAll('[data-elec]').forEach(c => { c.onchange = () => { S.elec.rows[+c.dataset.elec].on = c.checked; renderProj(); }; });
    const ea = $('#elecAll'); if (ea) ea.onchange = () => { S.elec.rows.forEach(r => { if (r.etat !== 'ok') r.on = ea.checked; }); renderProj(); };
    document.querySelectorAll('[data-eleccancel]').forEach(b => { b.onclick = () => { S.elec = null; renderProj(); }; });
    const eh = $('#elecHw'); if (eh) eh.onchange = () => { S.elec.hwOn = eh.checked; renderProj(); };
    const ef = $('#elecFiches'); if (ef) ef.onchange = () => { S.elec.ficheOn = ef.checked; renderProj(); };
    document.querySelectorAll('[data-elecok]').forEach(b => { b.onclick = () => applyElec(); });
  }
  const me = $('#projMe'); if (me) me.onclick = () => { S.projForm = null; S.elec = null; S.meForm = S.meForm ? null : { hw: true, meca: true, lim: true, stop: true, gains: true, liste: true, traces: false }; renderProj(); };
  if (S.meForm && $('#meOk')) {
    ['meHw', 'meMeca', 'meLim', 'meStop', 'meGains', 'meListe', 'meTraces'].forEach(id => { $('#' + id).onchange = e => { S.meForm[{ meHw: 'hw', meMeca: 'meca', meLim: 'lim', meStop: 'stop', meGains: 'gains', meListe: 'liste', meTraces: 'traces' }[id]] = e.target.checked; }; });
    $('#meCancel').onclick = () => { S.meForm = null; renderProj(); };
    $('#meOk').onclick = async () => { const o = { ...S.meForm }; if (!o.hw && !o.meca && !o.lim && !o.stop && !o.gains && !o.traces) { setStatus('Coche au moins une partie du script.', true); return; } await exportMeScript(o); S.meForm = null; renderProj(); };
  }
  const dn = $('#projDone'); if (dn) dn.onclick = async () => { try { await writeDoc('projects', cur.id, { ...strip(cur), statut: done ? 'en cours' : 'termine', termine: done ? null : Date.now() }); setStatus(done ? '' : 'Projet terminé et sauvegardé. Crée le suivant avec « + Projet ».'); } catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); } };
  if (S.projForm) {
    $('#pfNom').oninput = e => { S.projForm.nom = e.target.value; };
    $('#pfNom').onkeydown = e => { if (e.key === 'Enter') $('#pfOk').click(); };
    const c = $('#pfCopy'); if (c) c.onchange = () => { S.projForm.copy = c.checked; };
    $('#pfCancel').onclick = () => { S.projForm = null; renderProj(); };
    $('#pfOk').onclick = async () => {
      const f = S.projForm, nom = (f.nom || '').trim(); if (!nom) { setStatus('Donne un nom au projet.', true); return; }
      try {
        if (f.mode === 'ren') await writeDoc('projects', cur.id, { ...strip(cur), nom });
        else {
          const id = newId('projects'), from = S.projId;
          await writeDoc('projects', id, { nom, statut: 'en cours', cree: Date.now() });
          if (f.copy) for (const a of S.axes.filter(x => x.projetId === from)) await writeDoc('axes', newId('axes'), { ...strip(a), projetId: id });
          S.projId = id; S.axisId = null; S.draft = null; S.dirty = false; try { localStorage.setItem('servo-proj', id); } catch (e) {}
        }
        S.projForm = null; setStatus(''); onData();
      } catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); }
    };
  }
}
/* ---------- Onglets Brushless et ATV320 : le matériel du projet, réglé ici et écrit par le script ---------- */
const IO_MODES = ['IO0_Mode', 'IO1_Mode', 'IO4_Mode', 'IO5_Mode'];
const IO_MODE_DEF = { IO0_Mode: 1, IO1_Mode: 1, IO4_Mode: 0, IO5_Mode: 0 };
const ioModesOf = a => ({ ...IO_MODE_DEF, ...(a.ioModes || {}) });
const ioCardOf = a => a.ioCard ?? a.gamme === 'LXM62';
const projTop = () => '<div class="panel" style="padding:10px 12px"><div class="topbar" id="projbar"></div></div>';
const noProj = () => projTop() + '<div class="panel" style="margin-top:14px"><div class="empty"><b>Aucun projet</b><span>Crée ton premier projet avec « + Projet ».</span></div></div>';
const motorRefOf = a => S.motors.find(m => m.id === a.moteurId)?.ref || a.moteurRef || '';
const optH = (val, cur, lab) => `<option value="${esc(val)}" ${String(cur ?? '') === String(val) ? 'selected' : ''}>${esc(lab ?? val)}</option>`;
function brushList() { return pAxes().slice().sort((a, b) => (num(a.ordre) ?? 1e9) - (num(b.ordre) ?? 1e9) || String(a.nom).localeCompare(String(b.nom), 'fr', { numeric: true })); }
async function axisPatch(a, patch) {
  if (S.dirty && S.draft && !S.draft._new && S.draft.id === a.id) { setStatus('« ' + a.nom + ' » a des modifications non enregistrées dans l’onglet Axes : enregistre-les ou annule-les d’abord.', true); render(); return; }
  try { await writeDoc('axes', a.id, { ...strip(a), ...patch }); setStatus('« ' + a.nom + ' » enregistré.'); }
  catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); }
}
function renderBrushless() {
  const v = $('#view'); if (!allLoaded()) { v.innerHTML = ''; return; }
  if (!curProj()) { v.innerHTML = noProj(); renderProj(); return; }
  const L = brushList(), nHw = L.filter(a => a.gamme === 'LXM62' || a.gamme === 'ILM62').length, nBmp = L.filter(a => a.gamme === 'BMP').length, F = S.blForm || (S.blForm = { nom: '', gamme: 'LXM62' });
  const ords = L.filter(a => (a.gamme === 'LXM62' || a.gamme === 'ILM62') && num(a.ordre) != null).map(a => num(a.ordre)), dup = [...new Set(ords.filter((o, i) => ords.indexOf(o) !== i))];
  const rows = L.map((a, i) => {
    const g = a.gamme || '', bmp = g === 'BMP', card = !!g && !bmp && ioCardOf(a), m = ioModesOf(a);
    const crees = !g ? 'rien (axe virtuel)' : bmp ? 'rien ici : moteur sur ATV320 (onglet ATV320, réglages en Modbus)' : [a.leEnc !== false ? 'LE_' + a.nom : null, 'DRV_' + a.nom, card ? 'IO_' + a.nom : null].filter(Boolean).join(' · ');
    return `<tr data-bl="${esc(a.id)}" class="${g ? '' : 'bl-virt'}">
    <td class="ordcell"><input type="number" min="1" step="1" class="w-s" data-f="ordre" value="${esc(a.ordre ?? '')}" aria-label="Ordre Sercos de ${esc(a.nom)}"><span class="ordbtns"><button type="button" class="ordbtn" data-move="-1" title="Monter" aria-label="Monter ${esc(a.nom)}" ${i === 0 ? 'disabled' : ''}>▲</button><button type="button" class="ordbtn" data-move="1" title="Descendre" aria-label="Descendre ${esc(a.nom)}" ${i === L.length - 1 ? 'disabled' : ''}>▼</button></span></td>
    <td><button class="linkbtn" data-open="${esc(a.id)}" title="Ouvrir le réglage de l’axe">${esc(a.nom || 'Sans nom')}</button>${a.desc ? `<div class="el-sub">${esc(a.desc)}</div>` : ''}<div class="el-sub mono" style="font-size:11px" title="Ce que le script crée dans Machine Expert">${esc(crees)}</div></td>
    <td><select class="w-g" data-f="gamme" aria-label="Variateur de ${esc(a.nom)}">${optH('', g, 'Aucun (virtuel)')}${optH('LXM62', g)}${optH('ILM62', g)}${optH('BMP', g, 'Sur ATV320')}</select></td>
    <td><input type="text" class="w-m" data-f="variateur" value="${esc(a.variateur || '')}" placeholder="${g === 'ILM62' ? 'intégré au moteur' : 'référence'}" aria-label="Référence du variateur de ${esc(a.nom)}" ${g ? '' : 'disabled'}></td>
    <td class="el-sub">${esc(motorRefOf(a) || '—')}</td>
    <td class="c"><input type="checkbox" data-f="leEnc" ${a.leEnc !== false && !bmp ? 'checked' : ''} ${g && !bmp ? '' : 'disabled'} aria-label="Codeur LE_ de ${esc(a.nom)}"></td>
    <td class="c"><input type="checkbox" data-f="ioCard" ${card ? 'checked' : ''} ${g && !bmp ? '' : 'disabled'} aria-label="Carte IO_ de ${esc(a.nom)}"></td>
    ${IO_MODES.map(k => `<td class="c"><select data-io="${k}" ${card ? '' : 'disabled'} aria-label="${k} de ${esc(a.nom)}">${optH(0, m[k])}${optH(1, m[k])}</select></td>`).join('')}
    </tr>`;
  }).join('');
  v.innerHTML = projTop() + `<div class="panel" style="margin-top:14px"><div class="panel-h"><h2>Variateurs brushless · ${nHw} axe${nHw > 1 ? 's' : ''} Sercos sur ${L.length}${nBmp ? ` · ${nBmp} sur ATV320` : ''}</h2></div>
    <div class="tabnote">Ce que le script crée dans Machine Expert pour chaque axe, dans l’ordre Sercos : codeur LE_, variateur DRV_, carte IO_. Chaque modification est enregistrée aussitôt. Le réglage du moteur (réducteur, charge, gains) se fait dans l’onglet Axes.
      <details class="tabmore"><summary>Détail des colonnes</summary><ul>
        <li><b>Ordre</b> : position sur l’anneau Sercos, celle du dossier élec au départ. Les flèches ▲▼ déplacent un axe (les numéros sont refaits 1, 2, 3…), ou tape un numéro.</li>
        <li><b>Variateur</b> : LXM62 (module en armoire) ou ILM62 (intégré au moteur). « Aucun » = axe virtuel (Master, MC_Cut…), rien n’est créé. <b>Sur ATV320</b> : moteur asynchrone (SEW, Leroy-Somer…) ou synchrone (BMP, tambour NGI MTS62, Interroll DM) piloté par un ATV320 (CANopen) ; l’axe sert au calcul avec son réducteur (HSP, LSP, ITH, limite de courant), le variateur est dans l’onglet ATV320 et se règle en Modbus.</li>
        <li><b>Référence</b> : celle du dossier élec (pour information). Un module double Lexium 62 se déclare dans Machine Expert comme deux variateurs : rien de particulier à faire.</li>
        <li><b>LE_</b> : codeur logique, créé sous l’automate. <b>IO_</b> : carte IO sous le variateur, ses voies renommées TP_, DQ_, DI_ + nom de l’axe.</li>
        <li><b>IO0, IO1, IO4, IO5</b> : modes des voies de la carte IO, écrits à chaque lancement (valeurs de l’Auto_Pannel : 1, 1, 0, 0). Absents sur une carte : laissés.</li></ul></details></div>
    ${dup.length ? `<div class="warnline">Même ordre Sercos sur plusieurs axes : ${dup.join(', ')}. Les axes sont créés dans l’ordre du tableau.</div>` : ''}
    ${L.length ? `<div class="tblwrap" style="margin-top:10px"><table class="gtbl"><thead><tr><th>Ordre</th><th>Axe · dans Machine Expert</th><th>Variateur</th><th>Référence</th><th>Moteur</th><th class="c" title="Codeur LE_">LE_</th><th class="c" title="Carte IO_">IO_</th>${IO_MODES.map(k => `<th class="c">${k.replace('_Mode', '')}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`
      : '<div class="empty"><b>Aucun axe dans ce projet</b><span>Importe le dossier élec (bandeau du projet) ou ajoute un axe ci-dessous.</span></div>'}
    <div class="pform addline"><span class="addlab">Ajouter un axe à la main</span><input type="text" id="blNom" placeholder="Nom (ex. MT9)" value="${esc(F.nom)}" autocomplete="off" aria-label="Nom du nouvel axe">
      <select id="blGamme" aria-label="Variateur du nouvel axe">${optH('LXM62', F.gamme)}${optH('ILM62', F.gamme)}${optH('BMP', F.gamme, 'Sur ATV320')}</select><button class="btn" id="blAdd">+ Axe</button></div></div>`;
  renderProj();
  v.querySelectorAll('tr[data-bl]').forEach(tr => {
    const A = () => S.axes.find(x => x.id === tr.dataset.bl);
    tr.querySelectorAll('[data-f]').forEach(el => { el.onchange = () => {
      const a = A(); if (!a) return;
      const f = el.dataset.f; let val = el.type === 'checkbox' ? el.checked : el.value.trim();
      if (f === 'ordre') { val = num(val); if (val != null) val = Math.max(1, Math.round(val)); }
      axisPatch(a, { [f]: val });
    }; });
    tr.querySelectorAll('[data-io]').forEach(el => { el.onchange = () => { const a = A(); if (a) axisPatch(a, { ioModes: { ...ioModesOf(a), [el.dataset.io]: +el.value } }); }; });
    tr.querySelectorAll('[data-move]').forEach(b => { b.onclick = async () => {
      if (S.dirty) { setStatus('Un axe a des modifications non enregistrées dans l’onglet Axes : enregistre-les ou annule-les d’abord.', true); return; }
      const list = brushList(), i = list.findIndex(x => x.id === tr.dataset.bl), j = i + (+b.dataset.move);
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      try {
        for (let k = 0; k < list.length; k++) if (num(list[k].ordre) !== k + 1) await writeDoc('axes', list[k].id, { ...strip(list[k]), ordre: k + 1 });
        setStatus('« ' + list[j].nom + ' » ' + (b.dataset.move === '-1' ? 'monté' : 'descendu') + ' : ordre ' + (j + 1) + '.');
      } catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); }
    }; });
  });
  v.querySelectorAll('[data-open]').forEach(b => { b.onclick = () => {
    const a = S.axes.find(x => x.id === b.dataset.open); if (!a) return;
    if (S.dirty && !(S.draft && S.draft.id === a.id)) { setStatus('Un axe a des modifications non enregistrées dans l’onglet Axes : enregistre-les ou annule-les d’abord.', true); return; }
    S.tab = 'axes'; S.axisId = a.id; if (!S.dirty) S.draft = { ...a }; try { localStorage.setItem('servo-tab', 'axes'); } catch (e) {} render();
  }; });
  $('#blNom').oninput = e => { F.nom = e.target.value; };
  $('#blNom').onkeydown = e => { if (e.key === 'Enter') $('#blAdd').click(); };
  $('#blGamme').onchange = e => { F.gamme = e.target.value; };
  $('#blAdd').onclick = async () => {
    const nom = String(F.nom || '').trim();
    if (!nom) { setStatus('Donne un nom à l’axe.', true); return; }
    if (pAxes().some(a => nrmE(a.nom) === nrmE(nom))) { setStatus('« ' + nom + ' » existe déjà dans ce projet.', true); return; }
    const ordre = Math.max(0, ...pAxes().map(a => num(a.ordre) || 0)) + 1;
    S.blForm = { nom: '', gamme: F.gamme };
    try { await writeDoc('axes', newId('axes'), { nom, gamme: F.gamme, ordre, typeCharge: 'lineaire', marge: 80, tStop: 0.2, projetId: S.projId, source: 'onglet Brushless' }); setStatus('Axe « ' + nom + ' » ajouté (ordre ' + ordre + '). Choisis son moteur et son réducteur dans l’onglet Axes.'); }
    catch (e) { S.blForm = { ...F }; setStatus('Impossible : ' + (e.message || e.code), true); }
  };
}
/* ATV320 : Node-ID, Optional device et paramètres choisis (colonnes), écrits dans chaque ATV320 par le script */
function atvList() { return (curProj()?.materiel || []).map((x, k) => ({ x, k })).filter(o => o.x.type === 'ATV320'); }
const atvParamsCat = () => hwCat()['ATV320']?.params || [];
const codeIn = (name, code) => { const c = String(code || '').trim(); if (!c) return false; return new RegExp('(^|[^A-Za-z0-9_])' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^A-Za-z0-9_])').test(String(name)); };
const HB_MS = cur => cur?.atvHeartbeat != null ? cur.atvHeartbeat : 200;
const TACHE_CAN = cur => cur?.atvTache != null ? cur.atvTache : 'TASK_SR_Main';
function atvInfo(n) {
  const P = atvParamsCat(), ex = P.find(p => p.n === n) || P.find(p => p.n.toLowerCase() === String(n).toLowerCase());
  if (ex) return ex;
  let c = P.filter(p => codeIn(p.n, n));
  if (c.length > 1) { const par = c.filter(p => p.n.includes('(' + String(n).trim() + ')')); if (par.length === 1) c = par; }
  return c.length === 1 ? c[0] : null;
}
async function projPatch(patch, msg) {
  const cur = curProj(); if (!cur) return;
  try { await writeDoc('projects', cur.id, { ...strip(cur), ...patch }); if (msg) setStatus(msg); }
  catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); }
}
function renderAtv() {
  const v = $('#view'); if (!allLoaded()) { v.innerHTML = ''; return; }
  const cur = curProj(); if (!cur) { v.innerHTML = noProj(); renderProj(); return; }
  const A = atvList(), cols = cur.atvCols || [], P = atvParamsCat(), F = S.atvForm || (S.atvForm = { col: '', nom: '', node: '' });
  const nodes = A.map(o => num(o.x.nodeId)).filter(n => n != null), dupN = [...new Set(nodes.filter((n, i) => nodes.indexOf(n) !== i))];
  const cell = (c, val, attr) => {
    const p = atvInfo(c.n);
    if (p && p.c && p.c.length) return `<select ${attr}>${optH('', val, '—')}${p.c.map(x => optH(x, val)).join('')}${val && !p.c.includes(val) ? optH(val, val) : ''}</select>`;
    return `<input type="text" class="w-m" ${attr} value="${esc(val ?? '')}" placeholder="${esc(attr.includes('data-all') ? 'pour tous' : (p?.v ?? ''))}" autocomplete="off">`;
  };
  const head = cols.map((c, j) => { const p = atvInfo(c.n); return `<th class="atvcol" title="${esc(p ? p.n : 'Pas dans la liste des paramètres importée : le script cherchera ce nom ou ce code')}">${esc(c.n)}${p?.u ? ` <span class="el-sub" style="text-transform:none">${esc(p.u)}</span>` : ''}${!p && P.length ? ' <span class="el-warn" title="absent de la liste importée">?</span>' : ''}<button class="xbtn" data-delcol="${j}" aria-label="Retirer la colonne ${esc(c.n)}">×</button></th>`; }).join('');
  const allOpt = A.length && A.every(o => o.x.optional !== false);
  const rows = A.map(({ x, k }) => `<tr data-atv="${k}"><td><b>${esc(x.nom)}</b>${x.src === 'manuel' ? '<div class="el-sub">ajouté à la main</div>' : ''}</td>
    <td>${esc(x.desc || '')}${x.ref || x.moteurRef ? `<div class="el-sub">${esc([x.ref, x.moteurRef].filter(Boolean).join(' · '))}${(d => d ? ` · In ${fmt(num(d.iNom), 1)} A · Imax ${fmt(num(d.iPeak), 1)} A` : x.ref ? ' · <span class="el-warn">réf. absente du catalogue Variateurs</span>' : '')(driveOf(x.ref))}</div>` : ''}</td>
    <td class="c"><input type="number" class="w-s" min="1" max="127" step="1" data-node value="${esc(x.nodeId ?? '')}" aria-label="Node-ID de ${esc(x.nom)}"></td>
    <td class="c"><input type="checkbox" data-opt ${x.optional !== false ? 'checked' : ''} aria-label="Optional device pour ${esc(x.nom)}"></td>
    ${cols.map((c, j) => `<td>${cell(c, (x.params || {})[c.n], `data-p="${j}" aria-label="${esc(c.n)} de ${esc(x.nom)}"`)}</td>`).join('')}
    <td>${x.src === 'manuel' ? `<button class="btn ghost" data-atvdel="${k}">Retirer</button>` : ''}</td></tr>`).join('');
  /* Plaque moteur de chaque ATV320. Chaque moteur sur ATV320 est un axe (onglet Axes) : la fiche moteur vient de l'axe.
     Asynchrone : NPR, UNS, NCR, FRS, NSP, COS, ITH (loi vectorielle) ; synchrone (BMP, tambour) : NCRS, NSPS, PPNS, PHS (loi SYN).
     HSP / LSP / ITH / limite de courant viennent du calcul de l'axe. Sans axe (ATV320 ajouté à la main) : fiche choisie ici. */
  const asyncs = S.motors.filter(estAsync), axesBmp = pAxes().filter(a => a.gamme === 'BMP');
  const bmpAxe = x => axesBmp.find(a => nrmE(a.nom) === nrmE(x.dossier || x.nom.replace(/^ATV320_/, ''))) || (x.bmp || /^BMP\d{4}/.test(refKey(x.moteurRef)) ? { nom: x.dossier || '?' } : null);
  const PL = A.map(({ x, k }) => { const ba = bmpAxe(x), d = driveOf(x.ref);
    if (ba && ba.id) { const m = S.motors.find(mm => mm.id === ba.moteurId) || null, R = m ? compute(ba) : null; return m && m.typeMot === 'async' ? { x, k, ba, m, d, R, axeA: true, P: atvPlaque(x, m, d) } : { x, k, ba, m, d, R, sync: true, P: null }; }
    const m = ba ? null : atvMotorOf(x); return { x, k, ba, m, d, P: ba ? null : atvPlaque(x, m, d) }; });
  const TAG = { crit: 'crit', warn: 'warn', info: 'ok' };
  const nv = (v, dec, u) => v == null ? '<span class="el-sub">?</span>' : fmt(v, dec) + (u ? ' <span class="el-sub">' + u + '</span>' : '');
  const grpM = (() => { const g = new Map(); asyncs.forEach(m => { const s = m.serie || 'Autres'; if (!g.has(s)) g.set(s, []); g.get(s).push(m); }); return [...g]; })();
  const volts = m => (String(m.tension || '').match(/\d{3}/g) || []).map(Number);
  const ppOf = (m, R) => R && R.pp ? R.pp : (num(m.paires) ?? (/^BMP/i.test(refKey(m.ref)) ? 5 : null));
  const ctrlCell = (P, R, m) => { const L = [...((P && P.checks) || []), ...(R ? (R.checks || []).filter(c => c[0] !== 'info') : [])].slice(0, 4);
    return L.map(c => `<div><span class="tag ${TAG[c[0]]}">${c[0] === 'crit' ? 'Alerte' : c[0] === 'warn' ? 'À vérifier' : 'Info'}</span> <span class="el-sub">${esc(c[1]).slice(0, 120)}</span></div>`).join('') || (m ? '<span class="tag ok">OK</span>' : ''); };
  const atvCell = (d, x) => d ? 'In ' + fmt(num(d.iNom), 1) + ' A · Imax ' + fmt(num(d.iPeak), 1) + ' A' + (num(d.puissance) != null ? ' · ' + fmt(num(d.puissance), 2) + ' kW' : '') : x.ref ? '<span class="el-warn">réf. absente du catalogue Variateurs</span>' : '<span class="el-sub">réf. inconnue</span>';
  const axeLink = (ba, m, d) => `<div class="el-sub">${m.typeMot === 'async' ? 'asynchrone (loi vectorielle)' : 'synchrone (loi SYN)'} · axe <b>${esc(ba.nom)}</b>, onglet Axes${d && num(m.i0) != null && num(d.iNom) != null && num(m.i0) > num(d.iNom) ? ' · <span class="el-warn">IN moteur > In ATV320</span>' : ''}</div>`;
  const plRows = PL.map(({ x, k, ba, m, d, P, R, sync, axeA }) => `<tr data-atvm="${k}"><td><b>${esc(x.nom)}</b></td>
    <td>${x.moteurRef ? `<span class="mono">${esc(x.moteurRef)}</span>` : '<span class="el-sub">pas de référence moteur dans le dossier</span>'}${x.moteurFab || x.moteurP != null || x.moteurI != null || x.moteurN != null ? `<div class="el-sub">${[x.moteurFab, x.moteurP != null ? fmt(x.moteurP, 3) + ' kW' : '', x.moteurI != null ? 'IN ' + fmt(x.moteurI, 2) + ' A' : '', x.moteurN != null ? fmt(x.moteurN, 0) + ' tr/min' : '', x.moteurU].filter(Boolean).map(esc).join(' · ')}</div>` : ''}</td>
    ${axeA ? `<td>${esc(m.ref)}${axeLink(ba, m, d)}</td>
      <td class="n">${nv(P.npr, 3, 'kW')}</td><td class="n">${nv(P.uns, 0, 'V')}</td><td class="n">${nv(P.ncr, 2, 'A')}<div class="el-sub">NCR</div></td><td class="n">${nv(P.frs, 0, 'Hz')}<div class="el-sub">FRS${R && R.hsp != null ? ' · HSP ' + fmt(R.hsp, 1) : ''}${R && R.lsp != null ? ' · LSP ' + fmt(R.lsp, 1) : ''}</div></td>
      <td class="n">${nv(P.nsp, 0, 'tr/min')}<div class="el-sub">NSP${R && R.nAtVmax ? ' · ' + fmt(R.nAtVmax, 0) + ' à Vmax' : ''}</div></td><td class="n">${nv(P.cos, 2, '')}</td>
      <td class="n">${R && R.ith != null ? nv(R.ith, 2, 'A') : nv(P.ith, 2, 'A')}<div class="el-sub">${R && R.ithPct != null ? fmt(R.ithPct, 0) + ' % de IN' : 'IN'}${R && R.pct != null ? ' · CLI ' + fmt(R.pct, 0) + ' %' : ''}</div></td>
      <td>${atvCell(d, x)}</td><td>${ctrlCell(P, R, m)}</td>`
    : sync ? (m ? `<td>${esc(m.ref)}${axeLink(ba, m, d)}</td>
      <td class="n">${num(m.pNom) != null ? nv(num(m.pNom), 3, 'kW') : num(m.m0) != null && num(m.nNom) ? nv(num(m.m0) * num(m.nNom) * 2 * Math.PI / 60 / 1000, 3, 'kW') : ''}</td><td class="n">${(() => { const v = volts(m); return v.length === 1 ? nv(v[0], 0, 'V') : v.length ? '<span class="el-sub">' + v.join('/') + ' V</span>' : '<span class="el-sub">?</span>'; })()}</td>
      <td class="n">${nv(num(m.i0), 2, 'A')}<div class="el-sub">NCRS</div></td><td class="n">${R && R.hsp != null ? nv(R.hsp, 1, 'Hz') : '<span class="el-sub">—</span>'}<div class="el-sub">HSP${R && R.lsp != null && R.pp ? ' · LSP ' + fmt(R.lsp, 1) : ''}</div></td>
      <td class="n">${nv(num(m.nNom), 0, 'tr/min')}<div class="el-sub">NSPS${R && R.nAtVmax ? ' · ' + fmt(R.nAtVmax, 0) + ' à Vmax' : ''}</div></td><td class="n">${(pp => pp ? fmt(pp, 0) + ' <span class="el-sub">p.</span>' : '<span class="el-sub">?</span>')(ppOf(m, R))}<div class="el-sub">PPNS${num(m.ke) != null ? ' · PHS ' + fmt(num(m.ke), 1) : ''}</div></td>
      <td class="n">${R && R.ith != null ? nv(R.ith, 2, 'A') : nv(num(m.i0), 2, 'A')}<div class="el-sub">${R && R.ithPct != null ? fmt(R.ithPct, 0) + ' % de IN' : 'IN'}${R && R.pct != null ? ' · CLI ' + fmt(R.pct, 0) + ' %' : ''}</div></td>
      <td>${atvCell(d, x)}</td><td>${ctrlCell(null, R, m)}</td>`
      : `<td colspan="10"><span class="el-sub">${ba.id ? 'Choisis le moteur dans l’axe <b>' + esc(ba.nom) + '</b> (onglet Axes) : la plaque s’affiche ici.' : 'L’axe <b>' + esc(ba.nom) + '</b> n’existe pas dans l’onglet Axes (réimporte le dossier ou crée-le).'}</span></td>`)
    : ba ? `<td colspan="10"><span class="el-sub">Réglages de l’ATV320 dans l’axe <b>${esc(ba.nom)}</b>, onglet Axes.</span></td>`
      : `<td><select data-mot aria-label="Fiche moteur de ${esc(x.nom)}"><option value="">${esc(x.moteurId ? '— d’après la référence du dossier —' : m ? 'auto : ' + m.ref : '— à choisir —')}</option>${grpM.map(([s, L]) => `<optgroup label="${esc(s)}">${L.map(mm => `<option value="${esc(mm.id)}" ${x.moteurId === mm.id ? 'selected' : ''}>${esc(mm.ref)}${num(mm.pNom) != null ? ' · ' + fmt(num(mm.pNom), 2) + ' kW' : ''}</option>`).join('')}</optgroup>`).join('')}</select>${!m && x.moteurRef ? `<div class="el-sub"><span class="el-warn">absente du catalogue</span> <button class="btn ghost" data-motnew="${k}" title="Référence et fabricant seulement : les données constructeur se saisissent depuis le catalogue ou la plaque">Créer la fiche</button></div>` : m && x.moteurId ? `<div class="el-sub">choisie ici</div>` : m && refKey(m.ref) !== refKey(x.moteurRef) ? `<div class="el-sub">${esc(m.ref)} (début de référence commun)</div>` : ''}</td>
    <td class="n">${m ? nv(P.npr, 3, 'kW') : ''}</td><td class="n">${m ? nv(P.uns, 0, 'V') : ''}</td><td class="n">${m ? nv(P.ncr, 2, 'A') : ''}</td><td class="n">${m ? nv(P.frs, 0, 'Hz') : ''}</td><td class="n">${m ? nv(P.nsp, 0, 'tr/min') : ''}</td><td class="n">${m ? nv(P.cos, 2, '') : ''}</td><td class="n">${m ? nv(P.ith, 2, 'A') : ''}</td>
    <td>${atvCell(d, x)}</td>
    <td>${ctrlCell(P, null, m)}</td>`}</tr>`).join('');
  const plaqueSyncTxt = r => { const m = r.m, R = r.R, v = volts(m); return r.x.nom + (r.x.nodeId != null ? ' (Node-ID ' + r.x.nodeId + ')' : '') + ' · ' + m.ref + ' · synchrone (loi SYN) | NCRS ' + (num(m.i0) != null ? fmt(num(m.i0), 2) + ' A' : '?') + ' | NSPS ' + (num(m.nNom) != null ? fmt(num(m.nNom), 0) + ' tr/min' : '?') + ' | PPNS ' + ((pp => pp ? fmt(pp, 0) : '?')(ppOf(m, R))) + ' | PHS ' + (num(m.ke) != null ? fmt(num(m.ke), 1) + ' V/krpm' : '?') + (v.length ? ' | UNS ' + v.join('/') + ' V' : '') + ' | ITH ' + (R && R.ith != null ? fmt(R.ith, 2) + ' A' : '?') + ' | HSP ' + (R && R.hsp != null ? fmt(R.hsp, 1) + ' Hz' : '?') + ' | LSP ' + (R && R.lsp != null && R.pp ? fmt(R.lsp, 1) + ' Hz' : '?') + (R && R.pct != null ? ' | CLI ' + fmt(R.pct, 0) + ' %' : ''); };
  const plaqueAxeATxt = r => { const R = r.R; return plaqueTxt(r.x, r.P) + (R ? ' | HSP ' + (R.hsp != null ? fmt(R.hsp, 1) + ' Hz' : '?') + ' | LSP ' + (R.lsp != null ? fmt(R.lsp, 1) + ' Hz' : '?') + (R.ith != null ? ' | ITH axe ' + fmt(R.ith, 2) + ' A' : '') + (R.pct != null ? ' | CLI ' + fmt(R.pct, 0) + ' %' : '') : ''); };
  const plaquesTxt = PL.filter(r => (r.P && r.P.m) || (r.sync && r.m)).map(r => r.sync ? plaqueSyncTxt(r) : r.axeA ? plaqueAxeATxt(r) : plaqueTxt(r.x, r.P)).join('\n');
  const plaquesHtml = A.length ? `<h3 class="elech" style="margin-top:14px">Moteurs des ATV320 · plaque signalétique <span class="el-sub">ce que le programme écrit en Modbus dans chaque ATV320 (menu Contrôle moteur). Les valeurs viennent de la fiche constructeur (Catalogue › Moteurs), retrouvée d’après la référence du dossier ; ce que le dossier indique sert seulement de contrôle (écart signalé). Chaque moteur sur ATV320 est un axe (onglet Axes) : asynchrone → NPR, UNS, NCR, FRS, NSP, COS (loi vectorielle) ; synchrone (BMP, tambour NGI MTS62 ou Interroll DM) → NCRS, NSPS, PPNS, PHS (loi SYN) ; dans les deux cas ITH, HSP, LSP et limite de courant d’après l’axe</span></h3>
    <div class="tblwrap"><table class="gtbl"><thead><tr><th>ATV320</th><th>Moteur (dossier)</th><th>Fiche moteur</th><th class="n" title="Rated motor power">NPR</th><th class="n" title="Rated motor voltage">UNS</th><th class="n" title="Rated motor current (synchrone : NCRS)">NCR</th><th class="n" title="Rated motor frequency (synchrone : HSP / LSP)">FRS</th><th class="n" title="Rated motor speed (synchrone : NSPS)">NSP</th><th class="n" title="Motor cos φ (synchrone : paires de pôles PPNS et FCEM PHS)">COS</th><th class="n" title="Motor thermal current">ITH</th><th>ATV320</th><th>Contrôles</th></tr></thead><tbody>${plRows}</tbody></table></div>
    <div class="pform addline">${plaquesTxt ? `<button class="btn" id="atvPlCopy">Copier les plaques</button><span class="el-sub">une ligne par ATV320 : asynchrone NPR | UNS | NCR | FRS | NSP | COS | ITH, synchrone NCRS | NSPS | PPNS | PHS | ITH | HSP | LSP | CLI, à coller dans la liste des paramètres Modbus</span>` : '<span class="el-sub">Aucune fiche moteur rattachée : choisis-la dans la colonne « Fiche moteur » ou crée-la (les fiches se créent aussi à l’import du dossier).</span>'}</div>` : '';
  const allRow = A.length > 1 ? `<tr class="all"><td><b>Tous</b></td><td class="el-sub">valeur mise sur tous les ATV320</td><td></td>
    <td class="c"><input type="checkbox" id="atvOptAll" ${allOpt ? 'checked' : ''} aria-label="Optional device pour tous"></td>${cols.map((c, j) => `<td>${cell(c, '', `data-all="${j}" aria-label="${esc(c.n)} pour tous"`)}</td>`).join('')}<td></td></tr>` : '';
  v.innerHTML = projTop() + meImpPanel() + `<div class="panel" style="margin-top:14px"><div class="panel-h"><h2>ATV320 · ${A.length} variateur${A.length > 1 ? 's' : ''} sur le CANopen</h2>
      <div class="pform" style="width:auto"><label class="btn" for="meJson" style="cursor:pointer">Importer depuis Machine Expert</label><input type="file" id="meJson" accept=".json,application/json" hidden></div></div>
    <div class="tabnote">Ce que le script écrit dans chaque ATV320 de Machine Expert : le Node-ID (et les COB-ID qui en dépendent), la case Optional device, le heartbeat, et au besoin un paramètre CANopen par colonne. Les réglages du variateur lui-même (ACC, DEC, vitesses…) sont gérés en Modbus par le programme : ils ne passent pas par ici, mais la <b>plaque du moteur</b> de chaque ATV320 (NPR, UNS, NCR, FRS, NSP, COS, ITH) est calculée plus bas d’après la fiche du catalogue Moteurs, avec un contrôle du calibre du variateur. Chaque modification est enregistrée aussitôt ; une case vide n’est pas écrite, Machine Expert garde sa valeur.
      <details class="tabmore"><summary>Détail</summary><ul>
        <li><b>Optional device</b> coché : le CANopen démarre même si cet ATV320 ne répond pas (variateur hors tension, option de machine absente).</li>
        <li><b>Heartbeat</b> : le Producer time (onglet General de l’ATV320, en principe 200 ms) doit être un multiple du cycle de la tâche qui cadence le bus CAN. Le script lit la tâche de cycle de bus de l’ATV320 et son cycle dans le projet, puis arrondit au multiple le plus proche (200 ms avec un cycle de 15 ms → 13 cycles = 195 ms) ; même consigne pour tous les ATV320 du projet.</li>
        <li><b>Node-ID</b> : quand le script le change, il recalcule aussi les COB-ID des PDO et de l’EMCY de l’ATV320 d’après leurs formules $NODEID+…, comme le fait l’éditeur.</li>
        <li><b>Colonnes</b> : seulement pour un paramètre CANopen de l’appareil (ceux de la liste lue dans Machine Expert : SDO Timeout, Nodeguarding…), rarement utile. La ligne « Tous » met la même valeur sur tous les ATV320. Le script cherche le paramètre par son nom exact et liste dans son rapport ce qu’il ne trouve pas.</li>
        <li>${P.length ? `Liste des paramètres de l’ATV320 : ${P.length} noms lus dans Machine Expert${hwCat()['ATV320']?.paramsLu ? ' (' + esc(hwCat()['ATV320'].paramsLu) + ')' : ''} : les colonnes proposent les choix possibles.` : `La liste des paramètres de l’ATV320 n’est pas encore dans l’outil : lance <b>explorer_materiel.py</b> dans Machine Expert puis importe <b>explo_materiel.json</b> ici (bouton « Importer depuis Machine Expert »). En attendant, tape le nom exact ou le code du paramètre.`}</li></ul></details></div>
    ${A.length ? `<div class="pform addline" style="margin-top:10px"><span class="addlab">Heartbeat (Producer time)</span><input type="number" id="atvHb" class="w-s" min="0" step="1" value="${esc(HB_MS(cur))}" aria-label="Producer time en ms" style="width:90px"><span class="el-sub">ms, arrondi par le script au multiple le plus proche du cycle de la tâche du bus (ex. 200 → 195 avec un cycle de 15 ms)</span><input type="text" id="atvTache" value="${esc(TACHE_CAN(cur))}" placeholder="TASK_SR_Main" aria-label="Tâche de secours si l’appareil n’en a pas" autocomplete="off" style="width:160px"><span class="el-sub">0 = ne pas toucher. Le script lit la tâche de cycle de bus de chaque ATV320 (Bus cycle task, héritée du CAN_Manager si « parent ») et son cycle dans le projet ; la tâche saisie ici ne sert que s’il ne la trouve pas. Sans cycle lisible, il écrit la valeur telle quelle et le dit.</span></div>` : ''}
    ${dupN.length ? `<div class="warnline">Node-ID en double : ${dupN.join(', ')}.</div>` : ''}
    ${A.length ? `<div class="tblwrap" style="margin-top:10px"><table class="gtbl"><thead><tr><th>ATV320</th><th>Désignation</th><th class="c">Node-ID</th><th class="c">Optional device</th>${head}<th></th></tr></thead><tbody>${allRow}${rows}</tbody></table></div>`
      : '<div class="empty"><b>Aucun ATV320 dans ce projet</b><span>Ils viennent du dossier élec (gamme ATV320 dans « Liste actionneurs »), ou ajoute-en un ci-dessous.</span></div>'}
    ${plaquesHtml}
    ${A.length ? `<div class="pform addline"><span class="addlab">Ajouter une colonne (paramètre CANopen)</span><input type="text" id="atvCol" list="atvPList" placeholder="Paramètre CANopen (ex. SDO Timeout)" value="${esc(F.col)}" autocomplete="off" aria-label="Paramètre à ajouter" style="min-width:220px"><datalist id="atvPList">${P.map(p => `<option value="${esc(p.n)}">`).join('')}</datalist><button class="btn" id="atvColAdd">+ Paramètre</button></div>` : ''}
    <div class="pform addline"><span class="addlab">Ajouter un ATV320 à la main</span><input type="text" id="atvNom" placeholder="Repère (ex. M9)" value="${esc(F.nom)}" autocomplete="off" aria-label="Nom du nouvel ATV320"><input type="number" id="atvNode" class="w-s" min="1" max="127" placeholder="Node-ID" value="${esc(F.node)}" aria-label="Node-ID du nouvel ATV320" style="width:90px"><button class="btn" id="atvAdd">+ ATV320</button></div></div>`;
  renderProj(); bindMeImp();
  const L = () => (curProj().materiel || []).slice();
  const setItem = (k, f, msg) => { const l = L(); l[k] = f({ ...l[k] }); projPatch({ materiel: l }, msg); };
  v.querySelectorAll('tr[data-atv]').forEach(tr => {
    const k = +tr.dataset.atv, nom = (curProj().materiel || [])[k]?.nom;
    const nd = tr.querySelector('[data-node]'); nd.onchange = () => { const n = Math.round(num(nd.value)); if (!(n >= 1 && n <= 127)) { setStatus('Node-ID entre 1 et 127.', true); render(); return; } setItem(k, x => ({ ...x, nodeId: n, nodeIdManuel: true }), nom + ' : Node-ID ' + n + '.'); };
    tr.querySelector('[data-opt]').onchange = e => setItem(k, x => ({ ...x, optional: e.target.checked }), nom + ' : Optional device ' + (e.target.checked ? 'coché' : 'décoché') + '.');
    tr.querySelectorAll('[data-p]').forEach(el => { el.onchange = () => { const c = cols[+el.dataset.p]; setItem(k, x => { const p = { ...(x.params || {}) }; const val = el.value.trim(); if (val === '') delete p[c.n]; else p[c.n] = val; return { ...x, params: p }; }, nom + ' : ' + c.n + (el.value.trim() ? ' = ' + el.value.trim() : ' vidé (non écrit)') + '.'); }; });
    const del = tr.querySelector('[data-atvdel]'); if (del) del.onclick = () => { const l = L(); l.splice(k, 1); projPatch({ materiel: l }, '« ' + nom + ' » retiré.'); };
  });
  v.querySelectorAll('[data-all]').forEach(el => { el.onchange = () => { const c = cols[+el.dataset.all], val = el.value.trim(); if (val === '') return; const l = L().map(x => x.type === 'ATV320' ? { ...x, params: { ...(x.params || {}), [c.n]: val } } : x); projPatch({ materiel: l }, c.n + ' = ' + val + ' sur les ' + A.length + ' ATV320.'); }; });
  v.querySelectorAll('tr[data-atvm]').forEach(tr => {
    const k = +tr.dataset.atvm, x0 = (curProj().materiel || [])[k] || {}, nom = x0.nom;
    const sm = tr.querySelector('[data-mot]'); if (sm) sm.onchange = () => { const id = sm.value; setItem(k, x => { const y = { ...x }; if (id) y.moteurId = id; else delete y.moteurId; return y; }, nom + ' : fiche moteur ' + (id ? (S.motors.find(m => m.id === id) || {}).ref : 'd’après la référence du dossier') + '.'); };
    const nb = tr.querySelector('[data-motnew]'); if (nb) nb.onclick = () => { S.lib.motors = ficheAsync({ ref: x0.moteurRef, fab: x0.moteurFab || '', p: x0.moteurP ?? null, iN: x0.moteurI ?? null, n: x0.moteurN ?? null, u: x0.moteurU || '', poles: x0.moteurPoles ?? null, noms: [nom] }, ''); S.confirm = null; goTab('asyncs'); setStatus('Fiche pré-remplie avec la référence et le fabricant du dossier : saisis les données constructeur (catalogue ou plaque) puis « Ajouter ». Elle sera rattachée à ' + nom + ' par sa référence.'); };
  });
  const pc = $('#atvPlCopy'); if (pc) pc.onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(plaquesTxt) : Promise.reject()).then(() => { pc.textContent = 'Copié'; setTimeout(() => { pc.textContent = 'Copier les plaques'; }, 1500); }).catch(() => { pc.textContent = 'Copie refusée'; }); };
  const hb = $('#atvHb'); if (hb) hb.onchange = () => { const n = Math.round(num(hb.value) ?? 0); if (!(n >= 0)) { setStatus('Producer time : un nombre de ms (0 = ne pas toucher).', true); return; } projPatch({ atvHeartbeat: n }, n ? 'Producer time ' + n + ' ms sur tous les ATV320 (arrondi au multiple du cycle par le script).' : 'Producer time : le script n’y touche plus.'); };
  const tc = $('#atvTache'); if (tc) tc.onchange = () => { const t = tc.value.trim(); projPatch({ atvTache: t }, t ? 'Cycle lu sur la tâche ' + t + '.' : 'Pas de tâche : Producer time écrit tel quel.'); };
  const oa = $('#atvOptAll'); if (oa) oa.onchange = () => { const l = L().map(x => x.type === 'ATV320' ? { ...x, optional: oa.checked } : x); projPatch({ materiel: l }, 'Optional device ' + (oa.checked ? 'coché' : 'décoché') + ' sur les ' + A.length + ' ATV320.'); };
  v.querySelectorAll('[data-delcol]').forEach(b => { b.onclick = () => { const c = cols[+b.dataset.delcol]; const l = L().map(x => { if (x.type !== 'ATV320' || !x.params || !(c.n in x.params)) return x; const p = { ...x.params }; delete p[c.n]; return { ...x, params: p }; }); projPatch({ atvCols: cols.filter((_, j) => j !== +b.dataset.delcol), materiel: l }, 'Colonne ' + c.n + ' retirée : ce paramètre n’est plus écrit.'); }; });
  const ca = $('#atvColAdd');
  if (ca) {
    $('#atvCol').oninput = e => { F.col = e.target.value; };
    $('#atvCol').onkeydown = e => { if (e.key === 'Enter') ca.click(); };
    ca.onclick = () => {
      const n = String(F.col || '').trim(); if (!n) { setStatus('Choisis ou tape un paramètre.', true); return; }
      if (cols.some(c => c.n.toLowerCase() === n.toLowerCase())) { setStatus('« ' + n + ' » est déjà une colonne.', true); return; }
      const p = atvInfo(n);
      S.atvForm = { ...F, col: '' };
      projPatch({ atvCols: [...cols, { n }] }, p ? (p.n !== n ? '« ' + n + ' » = « ' + p.n + ' » dans Machine Expert.' : '« ' + n + ' » ajouté.') : (P.length ? '« ' + n + ' » n’est pas dans la liste importée : le script le cherchera par son nom ou son code et dira s’il ne le trouve pas.' : '« ' + n + ' » ajouté.'));
    };
  }
  $('#atvNom').oninput = e => { F.nom = e.target.value; };
  $('#atvNode').oninput = e => { F.node = e.target.value; };
  $('#atvAdd').onclick = () => {
    let nom = hwName(F.nom); if (!nom) { setStatus('Donne un nom à l’ATV320 (son repère, ex. M9).', true); return; }
    const l = L(), dossier = nom;
    if (!/^ATV/i.test(nom)) nom = hwNommer('ATV320', { dossier, n: l.filter(x => x.type === 'ATV320').length + 1 });
    if (l.some(x => x.nom === nom)) { setStatus('« ' + nom + ' » existe déjà.', true); return; }
    const n = F.node !== '' ? Math.round(num(F.node)) : Math.max(0, ...A.map(o => num(o.x.nodeId) || 0)) + 1;
    if (!(n >= 1 && n <= 127)) { setStatus('Node-ID entre 1 et 127.', true); return; }
    if (!l.some(x => x.type === 'CAN_Layer')) l.unshift({ nom: 'CAN_Layer', type: 'CAN_Layer', parent: 'LMC_PacDrive', src: 'manuel' }, { nom: 'CAN_Manager', type: 'CAN_Manager', parent: 'CAN_Layer', src: 'manuel', apres: 'CAN_Layer' });
    const last = l.map(x => x.type).lastIndexOf('ATV320'), at = last >= 0 ? last + 1 : l.findIndex(x => x.type === 'CAN_Manager') + 1;
    l.splice(at, 0, { nom, dossier, type: 'ATV320', parent: 'CAN_Manager', nodeId: n, nodeIdManuel: true, src: 'manuel', apres: l[at - 1]?.nom });
    S.atvForm = { ...F, nom: '', node: '' };
    projPatch({ materiel: l }, '« ' + nom + ' » ajouté (Node-ID ' + n + ').');
  };
}
/* ---------- Import de explo_materiel.json (script explorer_materiel.py lancé dans Machine Expert) ---------- */
async function readMeJson(f) {
  try {
    const j = JSON.parse(await f.text());
    if (!j || j.source !== 'explorer_materiel' || !Array.isArray(j.appareils)) throw new Error('ce n’est pas le fichier explo_materiel.json du script explorer_materiel.py');
    S.meImp = meImpAnalyse(j, f.name); setStatus(''); render();
  } catch (e) { S.meImp = null; setStatus('Fichier illisible : ' + (e.message || e), true); render(); }
}
const famOf = r => sousTete(r.parent) ? 'Module TM5' : r.parent === 'CAN_Manager' ? 'Variateur CAN' : r.parent === 'EIPS_Scanner' ? 'Ethernet/IP' : HW_FAM0(r.ref);
function meImpAnalyse(j, file) {
  const T = Object.values(hwCat()), A = j.appareils.filter(a => a && a.nom && a.type != null);
  const plc = j.plc || A.find(a => a.nom === 'LMC_PacDrive') || null, byN = new Map(A.map(a => [a.nom, a]));
  const nrm = a => ({ devType: num(a.type), devId: plc && String(a.id) === String(plc.id) ? 'plc_id' : String(a.id ?? ''), devVer: plc && String(a.version) === String(plc.version) ? 'plc_v' : String(a.version ?? ''), module: String(a.module || '') });
  const typeOf = a => { if (!a || a.type == null) return null; const n = nrm(a); return T.find(t => num(t.devType) === n.devType && String(t.devId ?? '') === n.devId && String(t.module || '') === n.module) || null; };
  const anc = a => { const out = []; let p = byN.get(a.parent), g = 0; while (p && g++ < 30) { out.push(p); p = byN.get(p.parent); } return out; };
  const rows = [], seen = new Set(); let connus = 0, ignores = 0;
  for (const a of A) {
    if (a.nom === 'LMC_PacDrive') continue;
    const n = nrm(a), key = [n.devType, n.devId, n.devVer, n.module].join('|');
    /* DeviceID de l'automate sans module : noeuds internes (Sercos_Master, E/S de l'automate, DRV_ / IO_ / LE_ dont le module n'est pas lisible) */
    if (n.devId === 'plc_id' && !n.module) { ignores++; continue; }
    if (seen.has(key)) continue; seen.add(key);
    const t = typeOf(a);
    if (t) { if (String(t.devVer ?? '') !== n.devVer) rows.push({ etat: 'version', a, n, t, on: false }); else connus++; continue; }
    if (anc(a).some(u => /^(LXM62|ILM62)/i.test(String(u.module || ''))) || anc(a).map(typeOf).some(u => u && ['Variateur Sercos', 'Carte IO', 'Codeur', 'Variateur CAN'].includes(u.serie || HW_FAM0(u.ref)))) { ignores++; continue; }
    const pA = byN.get(a.parent), pT = typeOf(pA);
    /* nœud fixe BC_… d'une tête TM5NS31 : ce n'est pas un appareil à créer, mais le parent de l'alim TM5SPS3 */
    if (/^BC_/.test(a.nom) && pT && pT.ref === 'TM5NS31') { ignores++; continue; }
    const parent = pT && pT.ref === 'TM5NS31' ? 'TM5NS31' : /^BC_/.test(String(a.parent || '')) && typeOf(byN.get(pA?.parent))?.ref === 'TM5NS31' ? 'BC_TM5NS31' : String(a.parent || '');
    const tn = String(a.typeName || '').trim(), m = /^(TM5[A-Z0-9]+?)(_\d+)?$/i.exec(a.nom);
    const ref = /^[A-Za-z0-9_\-]{3,40}$/.test(tn) ? tn : m ? m[1].toUpperCase() : a.nom;
    rows.push({ etat: 'nouveau', a, n, ref, parent, on: sousTete(parent) || (pT && ['CAN_Manager', 'EIPS_Scanner'].includes(pT.ref)) || parent === 'Sercos_Master' });
  }
  rows.sort((x, y) => (y.on ? 1 : 0) - (x.on ? 1 : 0));
  let atv = null;
  if (j.atv320 && Array.isArray(j.atv320.params) && j.atv320.params.length) {
    const ps = j.atv320.params.filter(p => p && p.n).slice(0, 1500).map(p => { const o = { n: String(p.n).slice(0, 120) }; if (p.v != null && p.v !== '') o.v = String(p.v).slice(0, 60); if (p.u) o.u = String(p.u).slice(0, 20); if (Array.isArray(p.c) && p.c.length) o.c = p.c.slice(0, 60).map(c => String(c).slice(0, 60)); return o; });
    atv = { ps, on: true, from: String(j.atv320.appareil || ''), opt: ps.filter(p => /^general options$|optional|optionnel/i.test(p.n)).map(p => p.n), hb: ps.filter(p => /producer.*time|heartbeat.*(time|producer)/i.test(p.n)).map(p => p.n),
      diffs: (j.atv_differences || []).filter(d => d && d.n && !/node.?id/i.test(d.n)).slice(0, 12), exp: (j.atv_exports || []).reduce((s, e) => s + (e.moins || []).length + (e.plus || []).length, 0) };
  }
  return { file, rows, connus, ignores, atv };
}
function meImpPanel() {
  const I = S.meImp; if (!I) return '';
  const nv = I.rows.filter(r => r.etat === 'nouveau').length, n = I.rows.filter(r => r.on).length + (I.atv && I.atv.on ? 1 : 0);
  const tr = I.rows.map((r, k) => `<tr><td><input type="checkbox" data-mi="${k}" ${r.on ? 'checked' : ''} aria-label="${esc(r.a.nom)}"></td><td><b>${esc(r.a.nom)}</b><div class="el-sub">sous ${esc(r.a.parent || '—')}</div></td>
    <td>${r.etat === 'nouveau' ? `<input type="text" class="w-m" data-mref="${k}" value="${esc(r.ref)}" aria-label="Type de ${esc(r.a.nom)}">` : esc(r.t.ref)}</td>
    <td class="mono">${esc([r.n.devType, r.n.devId, r.n.devVer].join(' / '))}${r.n.module ? ' · ' + esc(r.n.module) : ''}</td>
    <td>${r.etat === 'nouveau' ? 'Nouveau type' + (r.parent ? ', créé sous ' + esc(r.parent) : '') : 'Version ' + esc(r.t.devVer) + ' → ' + esc(r.n.devVer)}</td></tr>`).join('');
  const A = I.atv, diffs = A && A.diffs.length && !A.opt.length ? '<br>Différences entre les ATV320 du projet : ' + A.diffs.map(d => esc(d.n) + ' (' + Object.entries(d.valeurs || {}).map(([a, b]) => esc(a) + ' = ' + esc(b)).join(', ') + ')').join(' · ') : '';
  const atv = A ? `<label class="chk"><input type="checkbox" id="miAtv" ${A.on ? 'checked' : ''}> Liste des paramètres de l’ATV320 : ${A.ps.length} paramètres, lus sur ${esc(A.from)}</label>
    <div class="tabnote" style="padding:0">${A.opt.length ? 'Optional device : ' + (A.opt.some(n => /^general options$/i.test(n)) ? '3e drapeau de « General Options » (Write DCF, Create all SDOs, <b>Optional Device</b>, Not initialize, Reset Node)' : '« ' + A.opt.map(esc).join(' », « ') + ' »') + ' : le script le coche là.' : '<span class="el-warn">Aucun paramètre « Optional » ni « General Options » dans la liste</span> : envoie-moi rapport_explo_materiel.txt et les fichiers atv_*.export pour trouver où Machine Expert le range.'} ${A.hb && A.hb.length ? 'Heartbeat : « ' + A.hb.map(esc).join(' », « ') + ' ».' : '<span class="el-warn">Pas de paramètre de heartbeat (Producer time) dans la liste.</span>'}${diffs}</div>` : '';
  return `<div class="panel imp"><div class="panel-h"><h2>Import depuis Machine Expert · ${esc(I.file)}</h2><button class="btn ghost" id="miCancel">Fermer</button></div><div class="panel-b">
    <div class="tabnote" style="padding:0">${I.connus} type${I.connus > 1 ? 's' : ''} déjà au catalogue${I.ignores ? ', ' + I.ignores + ' appareil' + (I.ignores > 1 ? 's' : '') + ' interne' + (I.ignores > 1 ? 's' : '') + ' à l’automate (Sercos, DRV_, IO_, LE_, E/S) ignoré' + (I.ignores > 1 ? 's' : '') : ''}. ${nv ? nv + ' type' + (nv > 1 ? 's' : '') + ' inconnu' + (nv > 1 ? 's' : '') + ' : vérifie le nom du type, c’est la référence cherchée dans la colonne E de « Matériels » (ex. TM5SPS2), puis ajoute.' : 'Aucun type nouveau.'}</div>
    ${I.rows.length ? `<div class="tblwrap elecwrap"><table class="gtbl"><thead><tr><th></th><th>Appareil dans Machine Expert</th><th>Type</th><th>DeviceID</th><th>Action</th></tr></thead><tbody>${tr}</tbody></table></div><div class="el-sub">Un type inconnu dont tu tapes le nom d’un type existant (ex. LXM62PS) remplace le DeviceID de ce type : utile quand Machine Expert refuse l’ancien (« No device found »).</div>` : ''}
    ${atv}<div class="actions"><button class="btn primary" id="miOk" ${n ? '' : 'disabled'}>${n ? 'Ajouter au catalogue' : 'Rien à ajouter'}</button></div></div></div>`;
}
function bindMeImp() {
  const fi = $('#meJson'); if (fi) fi.onchange = () => { const f = fi.files[0]; fi.value = ''; if (f) readMeJson(f); };
  const I = S.meImp; if (!I || !$('#miOk')) return;
  document.querySelectorAll('[data-mi]').forEach(c => { c.onchange = () => { I.rows[+c.dataset.mi].on = c.checked; render(); }; });
  document.querySelectorAll('[data-mref]').forEach(c => { c.oninput = () => { I.rows[+c.dataset.mref].ref = c.value; }; });
  const ma = $('#miAtv'); if (ma) ma.onchange = () => { I.atv.on = ma.checked; render(); };
  $('#miCancel').onclick = () => { S.meImp = null; render(); };
  $('#miOk').onclick = async () => {
    const cat = hwCat(), todo = I.rows.filter(r => r.on); let n = 0, ver = 0; const skip = [];
    try {
      for (const r of todo) {
        if (r.etat === 'nouveau') {
          const ref = String(r.ref || '').trim().replace(/\s+/g, '');
          if (!ref) { skip.push(r.a.nom + ' (sans nom de type)'); continue; }
          if (cat[ref]) { const t = cat[ref]; await writeDoc('hwtypes', t.id, { ...strip(t), devType: r.n.devType, devId: r.n.devId, devVer: r.n.devVer, module: r.n.module, notes: 'DeviceID lu dans Machine Expert sur « ' + r.a.nom + ' » (' + I.file + '). ' + String(t.notes || '') }); ver++; continue; }
          await writeDoc('hwtypes', newId('hwtypes'), { ref, serie: famOf({ ...r, ref }), devType: r.n.devType, devId: r.n.devId, devVer: r.n.devVer, module: r.n.module, parent: r.parent, notes: 'Lu dans Machine Expert sur « ' + r.a.nom + ' » (' + I.file + ')' });
          n++;
        } else { await writeDoc('hwtypes', r.t.id, { ...strip(r.t), devVer: r.n.devVer }); ver++; }
      }
      let pm = '';
      if (I.atv && I.atv.on) { const t = hwCat()['ATV320']; if (t) { await writeDoc('hwtypes', t.id, { ...strip(t), params: I.atv.ps, paramsLu: I.atv.from + ', ' + new Date().toLocaleDateString('fr-FR') }); pm = 'Liste des ' + I.atv.ps.length + ' paramètres de l’ATV320 enregistrée.'; } }
      S.meImp = null;
      setStatus((n ? n + ' type' + (n > 1 ? 's' : '') + ' ajouté' + (n > 1 ? 's' : '') + ' au catalogue. ' : '') + (ver ? ver + ' fiche' + (ver > 1 ? 's' : '') + ' mise' + (ver > 1 ? 's' : '') + ' à jour. ' : '') + pm + (skip.length ? ' Non ajoutés : ' + skip.join(', ') + '.' : '') + (n ? (pm || skip.length ? ' ' : '') + 'Réimporte le dossier élec pour que le matériel les reconnaisse.' : ''), !!skip.length);
      render();
    } catch (e) { setStatus('Import arrêté : ' + (e.message || e.code), true); }
  };
}
const confirm_ = () => { setStatus('Modifications non enregistrées : enregistre ou annule l’axe avant de changer de projet.', true); return false; };
function render() {
  S.lastTab = { ...(S.lastTab || {}), [grpOf(S.tab).k]: S.tab };
  renderNav();
  if (S.tab === 'axes') renderAxes(); else if (S.tab === 'brushless') renderBrushless(); else if (S.tab === 'atv') renderAtv(); else if (S.tab === 'es') renderIo(); else if (S.tab === 'iodict') renderIoDict(); else if (S.tab === 'asyncs') renderLib('motors', 'async'); else renderLib(S.tab);
}



/* Aide « où trouver ce paramètre » : bouton ? à côté de chaque champ */
const WHERE = {
  'motors.ref': 'Plaque signalétique du moteur (champ « Type ») ou bon de livraison. Ex. SH31004P, ILM1001P. La lettre finale (P, M) est le bobinage ; « 01F » ou « F » dans la référence indique un frein.',
  'motors.typeMot': 'Plaque / catalogue : un moteur brushless ou à aimants (« PMSM », « servomoteur ») est synchrone. Un moteur triphasé classique à cage est asynchrone. Sur un variateur brushless (Lexium 62), c’est toujours un synchrone : la tension 230 / 400 V du catalogue ne compte pas, seul le Kt (bobinage) compte.',
  'motors.tension': 'Plaque signalétique. Utile uniquement pour un moteur asynchrone alimenté directement ou par un variateur de fréquence.',
  'motors.marque': 'Plaque du moteur ou colonne Fabricant du dossier élec. Sert à ranger la liste et à retrouver le catalogue.',
  'motors.pNom': 'Plaque : puissance nominale en kW. Dans l’ATV320 : [Puissance nom. mot.] NPR (menu Contrôle moteur). Le programme BFR l’écrit en Modbus.',
  'motors.freq': 'Plaque : fréquence nominale, 50 Hz en Europe. Dans l’ATV320 : [Fréq. nom. mot.] FRS.',
  'motors.iNom230': 'Plaque : courant nominal dans la colonne 230 V (couplage triangle Δ). Sert si l’ATV320 est un M2 / M3 (réseau 230 V). Vide : IN 400 V × √3.',
  'motors.cosPhi': 'Plaque : cos φ (facteur de puissance), entre 0,7 et 0,9. Dans l’ATV320 : [Cos. phi moteur] COS.',
  'motors.rendement': 'Plaque ou catalogue : rendement nominal en %. Information (classe IE), pas un paramètre de l’ATV320.',
  'motors.ke': 'Catalogue du moteur synchrone : constante de FCEM (force contre-électromotrice) en V pour 1000 tr/min, entre phases. Dans l’ATV320, menu [Moteur synchrone] : [Const. FEM sync] PHS. Tambours Interroll DM : colonne ke du tableau « Données électriques pour moteurs synchrones » ; NGI MTS62 : « Tension constante ».',
  'motors.serie': 'Les premiers caractères de la référence (ex. SH3 100 pour SH31004P). Sert seulement à ranger la liste.',
  'motors.kt': 'Catalogue / manuel du moteur, tableau des données techniques : « Torque constant kt » en Nm/A. Si la valeur n’est pas donnée, laisse vide : le site calcule M0 ÷ I0. Dans Machine Expert : paramètre TorqueConstant du dossier Motor du moteur réel.',
  'motors.jMotor': 'Catalogue, tableau « Rotor inertia » (kg·cm²) : prends la ligne AVEC frein si le moteur en a un. Dans Machine Expert : MotorInertia (dossier Motor), à privilégier car c’est la valeur lue sur le moteur réel.',
  'motors.m0': 'Catalogue, « Continuous stall torque M0 » (couple à l’arrêt, en Nm). Souvent aussi sur la plaque.',
  'motors.i0': 'Catalogue, « Continuous stall current I0 » (A eff). Courant correspondant à M0.',
  'motors.imax': 'Catalogue, « Peak current Imax » (A eff), ou plaque moteur. Ce n’est pas le courant crête du variateur.',
  'motors.nNom': 'Catalogue, « Nominal speed » (tr/min). Elle dépend de la tension d’alimentation : le tableau donne une ligne par tension (230 / 400 / 480 Vac). Prends celle de ton réseau.',
  'motors.nMax': 'Catalogue, « Max. permissible speed » (tr/min).',
  'motors.frein': 'Coche si la référence contient un frein (lettre F / « 01F… » dans le code type) ou si la plaque indique un frein 24 Vdc.',
  'motors.sonde': 'Catalogue : type de sonde de température du bobinage (ex. KTY84, PT1000). Facultatif.',
  'reducers.ref': 'Plaque du réducteur (champ « Type ») ou catalogue du fabricant. Ex. PLFN 090 i=7, KH47, KS703.',
  'reducers.marque': 'Fabricant inscrit sur la plaque (Neugart, SEW, STOBER, Interroll…).',
  'reducers.serie': 'Famille et taille du réducteur (ex. Neugart PLFN 090). Sert à regrouper la liste.',
  'reducers.ratio': 'Plaque du réducteur : « i » ou « Ratio ». Le rapport exact est souvent une fraction (ex. 70 = 1/70) : prends la valeur décimale précise du catalogue.',
  'reducers.t2n': 'Catalogue, tableau de sélection : T2N = couple nominal de sortie (parfois M2N). Souvent donné pour 100 % de service à ne=3000 ou 1400 tr/min : lis la note du tableau.',
  'reducers.t2b': 'Catalogue : T2B = couple d’accélération maximal en sortie (STOBER/SEW : « Mamax » ou M2B). Sert à fixer la limite de courant du moteur.',
  'reducers.t2not': 'Catalogue : T2Not = couple admissible en arrêt d’urgence (M2Not). Plus élevé que T2B. Souvent donné pour un nombre limité d’arrêts sur la vie du réducteur.',
  'reducers.jGear': 'Catalogue : inertie du réducteur ramenée côté ENTRÉE (J1), en kg·cm². Dépend du rapport et de la taille d’arbre/bride du moteur. Dans Machine Expert : J_Gear.',
  'reducers.gearIn': 'Le variateur veut des entiers : GearOut ÷ GearIn = rapport exact. Plaque ou catalogue (nombre de dents, « rapport exact »). Vide : l’outil le déduit (tableau des dents SEW, rapport entier, sinon fraction du rapport catalogue, signalée ⚠ car arrondie).',
  'reducers.gearOut': 'Voir GearIn : par exemple SEW KH19 i=6,91 → rapport exact 525/76 → GearIn 76, GearOut 525.',
  'reducers.integre': 'Coche si le réducteur fait corps avec le moteur (tambour moteur Interroll DM, motoréducteur livré monté). Le fabricant donne alors les couples de sortie rendement compris : l’outil divise par le rendement pour trouver le courant. Coché par défaut pour les séries « Interroll DM ». Décoche pour retrouver le calcul prudent (sans rendement).',
  'reducers.rendement': 'Catalogue (rendement en %), ou plaque. À défaut ~95 % pour un planétaire, ~90 % renvoi d’angle.',
  'drives.ref': 'Plaque du variateur, ex. LXM62DU60. Doit correspondre à la référence de ton projet Machine Expert.',
  'drives.serie': 'Famille du variateur (ex. Lexium 62 simple / double axe).',
  'drives.iPeak': 'Catalogue Lexium 62, « Peak current » du module (A). Dans Machine Expert : MaxDrivePeakCurrent.',
  'drives.iNom': 'Catalogue Lexium 62, courant de sortie permanent à 8 kHz (A).',
  'drives.format': 'Catalogue : simple axe ou double axe (un variateur pour 2 moteurs).',
  moteurId: 'Choisis la référence de la plaque du moteur. Absent de la liste : ajoute-le dans l’onglet Moteurs.',
  reducteurId: 'Choisis la référence + rapport de la plaque du réducteur. Absent : ajoute-le dans l’onglet Réducteurs.',
  nom: 'Le nom de l’axe dans ton projet Machine Expert (ex. MC1, DRV_MT2).',
  typeCharge: 'Linéaire : courroie, vis, crémaillère. Convoyeur : bande entraînée par un rouleau, il suffit du diamètre du rouleau. Rotative : plateau, pivot. Bielle-manivelle : rotation continue qui fait coulisser une plaque.',
  dRouleau: 'Plan ou mesure au pied à coulisse : diamètre extérieur du rouleau d’entraînement (tambour), en mm. FeedConstant théorique = π × D. Bande épaisse : ajoute son épaisseur au diamètre. Glissement ou dérive sur la machine : mesure l’avance réelle sur 10 tours et saisis le FeedConstant recalé.',
  feed: 'Machine Expert : FeedConstant de l’axe. Déplacement de la charge pour 1 tour de SORTIE du réducteur (ex. π × diamètre de la poulie, pas de la vis, 360 pour un axe en degrés).',
  masse: 'Masse totale qui se déplace (charge + chariot + courroie), en kg. Plan de la machine, ou pesée.',
  jLoadDirect: 'Inertie de la charge côté sortie du réducteur : modèle CAO (propriétés de masse, moment d’inertie autour de l’axe), ou formule (disque ½·m·r², tige…). En kg·cm² (1 kg·m² = 10 000 kg·cm²).',
  rManiv: 'Plan : distance entre l’axe de rotation et le maneton (la course de la plaque = 2 × ce rayon).',
  lBielle: 'Plan : entraxe entre le maneton et l’articulation sur la plaque.',
  mPlaque: 'CAO ou pesée : plaque + tout ce qu’elle porte et qui coulisse.',
  mBielle: 'CAO ou pesée : masse de la bielle seule.',
  jManiv: 'CAO : inertie de la manivelle (bras + contrepoids + maneton) autour de l’axe de rotation, côté sortie du réducteur.',
  jSupp: 'CAO ou formule : inertie des éléments ajoutés sur l’arbre de sortie (poulies, rouleaux, accouplement…).',
  vertical: 'Coche si la charge tombe quand le frein ou le moteur lâche (axe Z, levage).',
  vMax: 'Programme de l’automate (vitesse la plus haute demandée au mouvement) ou cahier des charges. Ce n’est pas la vitesse max du moteur.',
  tStop: 'Temps souhaité pour s’immobiliser en arrêt d’urgence. 0,15 à 0,2 s en général. Plus court = plus de couple sur le réducteur.',
  marge: 'Choix de ta marge de sécurité : 80 % de T2B autorisé = 20 % de marge.',
  acc: 'Programme de l’automate (accélération du mouvement) ou cahier des charges.',
  periode: 'Durée d’un aller-retour de l’oscillation, déduite du cycle de la machine.',
  velPRetenu: 'Machine Expert, dossier de l’axe / Controller : Vel_P_Gain. Reporte la valeur gardée après tes essais.',
  velIRetenu: 'Machine Expert : Vel_I_Gain, après essais.',
  velPActuel: 'Machine Expert : Vel_P_Gain actuellement réglé sur la machine (avant changement de charge ou de réducteur).',
  jLoadActuel: 'Machine Expert : J_Load actuellement réglé sur la machine.',
  jGearActuel: 'Machine Expert : J_Gear actuellement réglé sur la machine.',
  notes: 'Texte libre : source de la donnée, remarque, point à vérifier.',
  desc: 'Dossier élec, colonne « Nom » de la liste des actionneurs (ex. Convoyeur de sortie).',
  variateur: 'Dossier élec, colonne « Référence » de la liste des actionneurs, ou plaque du module Lexium 62.',
  gamme: 'Dossier élec, colonne « Gamme » : LXM62 ou ILM62. Les ATV320 et TeSys ne sont pas des axes : ils vont dans le matériel du projet.',
  ioCard: 'Dossier élec : coché quand le variateur est un LXM62 (carte IO montée dans le module). Un ILM62 n’a pas de carte IO.'
};
function whereOf(f, prefix) { const tab = S.tab === 'asyncs' ? 'motors' : S.tab; const w = (prefix === 'lib-' ? (WHERE[tab + '.' + f.k] || WHERE[f.k]) : WHERE[f.k]) || ''; return w && f.h && !w.includes(f.h) ? f.h + '. ' + w : (w || f.h || ''); }
const whBtn = w => w ? `<button type="button" class="whbtn" tabindex="-1" aria-label="Aide sur ce champ" title="Aide : à quoi sert ce champ, où trouver la valeur">?</button>` : '';
const whBox = w => w ? `<div class="where" hidden>${esc(w)}</div>` : '';
document.addEventListener('click', e => {
  const b = e.target.closest('.whbtn'); if (!b) return;
  e.preventDefault(); const f = b.closest('.field'), bx = f && f.querySelector('.where'); if (bx) { bx.hidden = !bx.hidden; b.classList.toggle('on', !bx.hidden); }
});

function inputHtml(f, val, prefix) {
  const id = prefix + f.k;
  const ga = f.g ? ` data-g="${f.g.join(' ')}"` : '';
  const wh = whereOf(f, prefix), tag = whBtn(wh), box = whBox(wh);
  if (f.t === 'bool') return `<div class="field wide"${ga}><label class="chk"><input type="checkbox" id="${id}" data-k="${f.k}" ${val ? 'checked' : ''}> ${esc(f.l)}${tag}</label>${box}</div>`;
  if (f.t === 'area') return `<div class="field wide"><label for="${id}">${esc(f.l)}${tag}</label><textarea id="${id}" data-k="${f.k}">${esc(val)}</textarea>${box}</div>`;
  let ctrl;
  if (f.t === 'motor' || f.t === 'reducer' || f.t === 'drive') {
    const list = f.t === 'motor' ? S.motors : f.t === 'reducer' ? S.reducers : S.drives;
    const groups = new Map(); list.forEach(x => { const g = x.serie || 'Autres'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); });
    const opt = x => `<option value="${esc(x.id)}" ${x.id === val ? 'selected' : ''}>${esc(x.ref)}${f.t === 'reducer' && x.t2b ? ' · T2B ' + esc(x.t2b) + ' Nm' : ''}${f.t === 'drive' && x.iPeak ? ' · ' + esc(x.iPeak) + ' A' : ''}</option>`;
    if (f.t === 'drive') ctrl = `<select id="${id}" data-k="${f.k}"><option value="">— Choisir —</option>${[...groups].map(([g, xs]) => `<optgroup label="${esc(g)}">${xs.map(opt).join('')}</optgroup>`).join('')}</select>`;
    else { const cur = list.find(x => x.id === val);
      ctrl = `<div class="combo" data-combo="${f.t}" data-ck="${f.k}"><div class="inp text"><input id="${id}" class="combo-in" role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Taper la référence (ex. ${f.t === 'motor' ? 'SH31004' : 'PLFN 090 i=7'})…" value="${esc(cur ? cur.ref : '')}"><span class="u" aria-hidden="true">▾</span></div><div class="combo-list" role="listbox" hidden></div></div>`; }
    const sel = f.t === 'reducer' && val ? S.reducers.find(x => x.id === val) : null;
    const sum = sel ? `<div class="rsum">Couple max <b>T2B ${sel.t2b != null ? fmt(num(sel.t2b), 0) + ' Nm' : '— (à renseigner)'}</b>${sel.t2n != null ? ' · T2N ' + fmt(num(sel.t2n), 0) + ' Nm' : ''}${sel.t2not != null ? ' · T2Not ' + fmt(num(sel.t2not), 0) + ' Nm' : ''} · i=${fmt(num(sel.ratio), 3)}</div>` : '';
    return `<div class="field wide"${ga}><label for="${id}">${esc(f.l)}${tag}</label>${ctrl}${sum}${box}</div>`;
  }
  if (f.t === 'select') {
    ctrl = `<select id="${id}" data-k="${f.k}">${f.o.map(([v, l]) => `<option value="${v}" ${v === (val || f.o[0][0]) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    return `<div class="field wide"><label for="${id}">${esc(f.l)}${tag}</label>${ctrl}${box}</div>`;
  }
  const txt = f.t === 'text';
  ctrl = `<div class="inp ${txt ? 'text' : ''}"><input id="${id}" data-k="${f.k}" ${txt ? '' : 'inputmode="decimal"'} autocomplete="off"${f.ph ? ` placeholder="${esc(f.ph)}"` : ''} value="${esc(val == null ? '' : (txt ? val : String(val).replace('.', ',')))}">${f.u ? `<span class="u">${esc(f.u)}</span>` : ''}</div>`;
  return `<div class="field ${txt ? 'wide' : ''}"${ga}><label for="${id}"><span${f.h ? ` class="hint" title="${esc(f.h)}"` : ''}>${esc(f.l)}</span>${tag}</label>${ctrl}${f.n ? `<div class="fnote">${esc(f.n)}</div>` : ''}${box}${f.conv ? `<div class="conv"><button type="button" class="convbtn" tabindex="-1">saisir en kg·m²</button><span class="convbox" hidden><input class="convin" data-for="${id}" inputmode="decimal" placeholder="valeur en kg·m²" aria-label="Valeur en kg·m², convertie en kg·cm²"><span>kg·m² → ×10 000</span></span></div>` : ''}</div>`;
}
function readInput(el) { if (el.type === 'checkbox') return el.checked; const k = el.dataset.k; return NUM_KEYS.has(k) ? (num(el.value)) : el.value; }

function renderAxes() {
  const v = $('#view');
  if (!allLoaded()) { v.innerHTML = ''; return; }
  const chipSt = a => { const R = compute(a); return R.missing ? 'c-todo' : R.checks.some(c => c[0] === 'crit') ? 'c-crit' : R.checks.some(c => c[0] === 'warn') ? 'c-warn' : 'c-ok'; };
  const chipTitle = (a, st) => { const n = (compute(a).acked || []).length; return (a.desc ? a.desc + ' · ' : '') + ({ 'c-todo': 'à compléter : moteur ou réducteur manquant', 'c-crit': 'réglé, avec une alerte à traiter', 'c-warn': 'réglé, avec un point à vérifier', 'c-ok': 'réglé, aucun problème' })[st] + (n ? ' · ' + n + ' attention' + (n > 1 ? 's' : '') + ' acquittée' + (n > 1 ? 's' : '') : ''); };
  const chips = brushList().map(a => { const st = chipSt(a); return `<button class="axischip ${st}" data-axis="${esc(a.id)}" title="${esc(chipTitle(a, st))}" aria-pressed="${a.id === S.axisId && !(S.draft && S.draft._new)}">${esc(a.nom || 'Sans nom')}</button>`; }).join('');
  const top = `<div class="panel" style="padding:10px 12px;display:flex;flex-direction:column;gap:10px"><div class="topbar" id="projbar"></div>
    ${S.projects.length ? `<div class="axisbar">${chips}<button class="btn ghost" id="newAxis">+ Axe</button></div>` : ''}</div>`;
  if (!S.draft) {
    const curP = curProj();
    v.innerHTML = top + (S.projects.length ? `<div class="panel" style="margin-top:14px"><div class="empty"><b>Aucun axe dans ce projet</b><span>Le plus rapide : importer le dossier électrique de la machine, qui crée les axes et le matériel. Sinon, ajoute un axe à la main.</span>
        <div class="actions">${curP && curP.statut !== 'termine' ? '<button class="btn primary" id="emptyElec">Importer le dossier élec</button>' : ''}<button class="btn" id="emptyAxis">+ Axe à la main</button><button class="btn ghost" id="emptyHelp">Comment ça marche ?</button></div></div></div>`
      : `<div class="panel" style="margin-top:14px"><div class="empty"><b>Aucun projet</b><span>Un projet = une machine. Crée-le, puis importe son dossier électrique ou ajoute ses axes.</span><div class="actions"><button class="btn primary" id="emptyProj">+ Projet</button><button class="btn ghost" id="emptyHelp">Comment ça marche ?</button></div></div></div>`);
    renderProj(); bindAxes(); return;
  }
  const d = S.draft, lin = (d.typeCharge || 'lineaire') === 'lineaire';
  const fs = g => `<fieldset><legend>${esc(g.t)}</legend>${g.note ? `<div class="gnote">${esc(g.note)}</div>` : ''}${g.f.filter(f => !f.show || [].concat(f.show).includes(d.typeCharge || 'lineaire')).map(f => inputHtml(f, f.k === 'ioCard' ? (d.ioCard ?? d.gamme === 'LXM62') : d[f.k], 'ax-')).join('')}</fieldset>`;
  const bmp = d.gamme === 'BMP', grp = AXIS_GROUPS.filter(g => !(bmp && g.lx) && !(!bmp && g.bmp));
  const main = grp.filter(g => !g.adv).map(fs).join('');
  const adv = grp.filter(g => g.adv).map(fs).join('');
  const isNew = !!d._new;
  v.innerHTML = top + `<div class="cols" style="margin-top:14px">
    <section class="panel"><div class="panel-h"><h2>${isNew ? 'Nouvel axe' : 'Axe ' + esc(d.nom || '')}</h2><span class="hsave"><span id="dirtyTag"></span><button class="btn primary" id="saveAxisTop" title="Enregistrer (Ctrl+S)" ${S.dirty ? '' : 'hidden'}>Enregistrer</button></span></div>
      <div class="panel-b" id="axisForm">${main}
        ${toolsBox(d)}
        <details class="more" id="advBox" ${S.advOpen ? 'open' : ''}><summary>Plus d’options <span class="el-sub">variateur Machine Expert · mouvement · gains existants · notes</span></summary><div class="inner">${adv}</div></details>
        <div class="actions"><button class="btn primary" id="saveAxis">Enregistrer</button>
        ${isNew ? '<button class="btn" id="cancelAxis">Annuler</button>' : '<button class="btn ghost" id="dupAxis">Dupliquer</button><button class="btn ghost" id="delAxis">Supprimer</button>'}</div>
      </div></section>
    <section class="panel sticky" id="results"></section></div>`;
  renderProj(); bindAxes();
  const ab = $('#advBox'); ab.ontoggle = () => { S.advOpen = ab.open; };
  renderResults(); updateDirty();
}

function updateDirty() { const t = $('#dirtyTag'); if (!t) return; t.innerHTML = S.dirty ? '<span class="dirty">Non enregistré</span>' : (S.justSaved ? '<span class="saved">Enregistré</span>' : ''); const b = $('#saveAxisTop'); if (b) b.hidden = !S.dirty; }

function renderResults() {
  const box = $('#results'); if (!box) return;
  const R = compute(S.draft);
  const TT = computeTools(S.draft, R);
  if (R.missing) {
    S.gstate = {}; colorFields();
    const d = S.draft, manq = [!S.motors.find(x => x.id === d.moteurId) ? 'le moteur' : null, !S.reducers.find(x => x.id === d.reducteurId) ? 'le réducteur' : null].filter(Boolean);
    const titre = manq.length ? 'Il manque ' + manq.join(' et ') : 'Fiche incomplète';
    box.innerHTML = `<div class="panel-h"><h2>À saisir dans le variateur</h2></div><div class="empty"><b>${esc(titre)}</b><span>${esc(R.why || (manq.length ? 'Choisis-' + (manq.length > 1 ? 'les' : 'le') + ' dans « Moteur et réducteur » : les valeurs à saisir dans le variateur s’affichent ici dès que l’ensemble est complet. Absent de la liste : ajoute-le dans le catalogue (onglets Moteurs / Réducteurs).' : 'Les réglages s’affichent dès que l’ensemble est complet.'))}</span></div>`;
    renderToolResults(TT); return; }
  const row = (n, v, u, key) => v == null || v === '—' ? '' : `<div class="prow ${key ? 'key' : ''}"><span class="pn">${esc(n)}</span><span class="pv">${esc(v)}${u ? `<small>${esc(u)}</small>` : ''}</span></div>`;
  const rowA = (n, v, u) => `<div class="prow"><span class="pn">${esc(n)}</span><span class="pv">${v == null ? '<small class="todo">vitesse du cycle à saisir</small>' : esc(v)}${v != null && u ? `<small>${esc(u)}</small>` : ''}</span></div>`;
  const vpR = num(S.draft.velPRetenu), viR = num(S.draft.velIRetenu);
  const mech = [row('J_Load', fmt(Math.round(R.JL / 10) * 10, 0), 'kg·cm²', 1), row('J_Gear', fmt(R.Jg, 3), 'kg·cm²', 1)].join('');
  const gen = [row('UserCurrentLimit', R.pct != null ? fmt(R.pct, 1) : null, '%', 1), row('DriveStopCurrentLimit', R.driveStopMa != null ? fmt(R.driveStopMa, 0) : null, 'mA'),
    rowA('ControllerStopDec', R.dec ? fmt(R.dec, 0) : null, 'Units/s²'), rowA('ControllerStopJerk', R.dec ? fmt(R.jerkStop, 0) : null, 'Units/s³'), rowA('StopTimeLim', R.dec ? fmt(R.stl, 0) : null, 'ms')].join('');
  const vpShow = vpR != null ? fmt(vpR, 2) : (R.velPTransp != null ? fmt(R.velPTransp, 1) : fmt(R.velPSugg, 1));
  const viShow = viR != null ? fmt(viR, 2) : fmt(R.velISugg, 1);
  const base = `base Schneider ${GAIN_BASE.p} / ${GAIN_BASE.i}, rapport charge / moteur seul ${fmt(R.ratioIn ?? 0, (R.ratioIn ?? 0) < 1 ? 2 : 1)}`;
  const vpSub = vpR != null ? 'retenu après essais' : (R.velPTransp != null ? 'transposé du réglage actuel' : 'proposé · ' + base);
  const viSub = viR != null ? 'retenu après essais' : 'proposé · ' + base;
  const grow = (n, v, sub) => `<div class="prow ${v != null ? 'key' : ''}"><span class="pn">${n}</span><span class="pv">${v != null ? esc(v) : '<span class="muted" style="font-size:12px;font-weight:400">à régler</span>'}</span></div>`;
  const gains = grow('Vel_P_Gain', vpShow) + grow('Vel_I_Gain', viShow) + (vpR == null || viR == null ? `<div class="pnote">${vpR == null && viR == null ? 'Valeurs proposées' : 'Valeur proposée'} : partir de là, monter par paliers de 10 % ; si le moteur grogne, redescendre de 30 %. Noter ensuite les valeurs retenues dans « Gains retenus après essais ».</div>` : '');
  const nMot = R.vMax && R.feed ? R.vMax / R.feed * R.i * 60 : null;
  const pctIn = R.Ilim != null && R.i0 ? Math.floor(R.Ilim / R.i0 * 1000) / 10 : null;
  const atvGen = [rowA('HSP · grande vitesse', R.hsp != null ? fmt(R.hsp, 1) : null, 'Hz'), row('LSP · petite vitesse', R.lsp != null && R.pp ? fmt(R.lsp, 1) : null, 'Hz', 1), row('ITH · courant thermique', R.ith != null ? fmt(R.ith, 2) : null, 'A', 1),
    row('Limite de courant (CLI)', R.Ilim != null ? fmt(R.Ilim, 2) : null, 'A', 1), row('Limite en % de Imax', R.pct != null ? fmt(R.pct, 1) : null, '%', 1), row('Limite de couple (TLIM)', pctIn != null ? fmt(pctIn, 0) : null, '% de MN'), row('Courant nominal IN', R.i0 != null ? fmt(R.i0, 2) : null, 'A'), row(R.async ? 'Imax moteur (150 % de IN)' : 'Imax moteur', R.async ? (R.i0 != null ? fmt(R.i0 * 1.5, 2) : null) : (num(R.m.imax) != null ? fmt(num(R.m.imax), 1) : null), 'A'), row('Imax ATV320' + (R.drv ? ' ' + R.drv.ref : ''), R.iDrv != null ? fmt(R.iDrv, 1) : null, 'A'), row('In ATV320', R.iDrvNom != null ? fmt(R.iDrvNom, 1) : null, 'A'),
    row('Couple nominal MN', R.m0 != null ? fmt(R.m0, 2) : null, 'Nm'), row('Fréquence nominale moteur', R.fNom != null ? fmt(R.fNom, 1) : null, 'Hz'), rowA('Vitesse moteur à Vmax', nMot ? fmt(nMot, 0) : null, 'tr/min'), rowA('Courant d’accélération', R.Iacc != null ? fmt(R.Iacc, 2) : null, 'A')].join('');
  const groups = R.atv ? `<div class="pgroups">
    <div class="pcol"><div class="pgroup"><div class="pg-h">Mécanique</div>${mech}<div class="pnote">Rapport ${fmt(R.i, 3)}${R.feed ? ' · FeedConstant ' + fmt(R.feed, 3) + ' Units/tr' : ''} · inertie vue par le moteur ${fmt(R.Jtot, 2)} kg·cm²</div></div></div>
    <div class="pgroup"><div class="pg-h">ATV320 (réglé en Modbus)</div>${atvGen}<div class="pnote">Limite = part de T2B autorisée ramenée au moteur, plafonnée au courant max du couple moteur + ATV320 (Imax). Le % est pris sur Imax, comme UserCurrentLimit. TLIM est le même réglage exprimé en % du couple nominal : il dépasse 100 % dès que la limite est au-dessus de IN (un BMP admet environ 2,5 × IN en pointe). Pas de paramètre Machine Expert pour cet axe.</div></div></div>` : `<div class="pgroups">
    <div class="pcol"><div class="pgroup"><div class="pg-h">Mechanic</div>${mech}<div class="pnote">${R.gears ? `GearIn ${R.gears.gIn} · GearOut ${R.gears.gOut}${R.gears.exact ? '' : ' ⚠'}` : 'GearIn 1 · GearOut ' + fmt(R.i, 3)}${R.feed ? ' · FeedConstant ' + fmt(R.feed, 3) : ''}${R.gears ? `<br>${esc(gearsNote(R.gears))}` : ''}</div></div>
    <div class="pgroup"><div class="pg-h">Control loop</div>${gains}</div></div>
    <div class="pgroup"><div class="pg-h">General</div>${gen}<div class="pnote">UserDefinedStopMode : Start with actual values</div></div></div>`;
  const P = R.atv ? [['Moteur', R.m.ref], ['Réducteur', R.r.ref + ' (i = ' + fmt(R.i, 3) + ')'], R.feed ? ['FeedConstant', fmt(R.feed, 3)] : null,
    ['HSP', R.hsp != null ? fmt(R.hsp, 1) + ' Hz' : '— (vitesse du cycle à saisir)'], ['LSP', R.lsp != null && R.pp ? fmt(R.lsp, 1) + ' Hz' : '—'], R.ith != null ? ['ITH', fmt(R.ith, 2) + ' A (' + fmt(R.ithPct, 0) + ' % de IN)'] : null, R.fNom != null ? ['Fréquence nominale moteur (FRS)', fmt(R.fNom, 1) + ' Hz'] : null, ['J_Load', fmt(Math.round(R.JL / 10) * 10, 0) + ' kg·cm²'], ['J_Gear', fmt(R.Jg, 3) + ' kg·cm²'], ['Inertie vue par le moteur', fmt(R.Jtot, 2) + ' kg·cm²'], ['Rapport d’inertie', fmt(R.ratioTot, 1)],
    R.Ilim != null ? ['Limite de courant (CLI)', fmt(R.Ilim, 2) + ' A' + (R.pct != null ? ' (' + fmt(R.pct, 1) + ' % de Imax)' : '')] : null, pctIn != null ? ['Limite de couple (TLIM)', fmt(pctIn, 0) + ' % de MN'] : null, R.i0 != null ? ['Courant nominal IN', fmt(R.i0, 2) + ' A'] : null, R.drv ? ['ATV320 ' + R.drv.ref, 'In ' + fmt(R.iDrvNom, 1) + ' A · Imax ' + fmt(R.iDrv, 1) + ' A'] : null, R.Iref ? ['Courant max moteur + ATV', fmt(R.Iref, 1) + ' A'] : null, nMot ? ['Vitesse moteur à Vmax', fmt(nMot, 0) + ' tr/min'] : null, R.Iacc != null ? ['Courant d’accélération', fmt(R.Iacc, 2) + ' A'] : null].filter(Boolean)
    : [['GearIn', R.gears ? String(R.gears.gIn) : '1'], ['GearOut', R.gears ? String(R.gears.gOut) : fmt(R.i, 3)], R.feed ? ['FeedConstant', fmt(R.feed, 3)] : null, ['J_Load', fmt(Math.round(R.JL / 10) * 10, 0)], ['J_Gear', fmt(R.Jg, 3)],
    R.pct != null ? ['UserCurrentLimit', fmt(R.pct, 1) + ' %'] : null, R.driveStopMa != null ? ['DriveStopCurrentLimit', fmt(R.driveStopMa, 0) + ' mA'] : null,
    ['ControllerStopDec', R.dec ? fmt(R.dec, 0) : '— (vitesse du cycle à saisir)'], ['ControllerStopJerk', R.dec ? fmt(R.jerkStop, 0) : '—'], ['StopTimeLim', R.dec ? fmt(R.stl, 0) + ' ms' : '—'],
    ['UserDefinedStopMode', 'Start with actual values'], ['Vel_P_Gain', vpShow + (vpR == null ? ' (proposé)' : '')], ['Vel_I_Gain', viShow + (viR == null ? ' (proposé)' : '')]].filter(Boolean);

  // Jauge réducteur : % du T2B
  let gear = ''; S.gstate = {};
  if (R.t2b) {
    const MAXP = 125, m = R.marge * 100;
    const items = [{ g: 'lim', l: R.atv ? 'Limite ' + (R.pct != null ? fmt(R.pct, 1) + ' % (' + fmt(R.Ilim, 2) + ' A)' : fmt(R.Ilim, 2) + ' A') : 'UserCurrentLimit ' + fmt(R.pct, 1) + ' %', t: R.Tlim }];
    if (R.Tucl != null) items.push({ g: 'ucl', l: 'Réglé : ' + fmt(R.ucl, 1) + ' %', t: R.Tucl });
    if (R.vertical && R.Ihold) items.push({ g: 'hold', l: 'Maintien charge', t: R.Ihold * R.kt * R.i * R.eta });
    if (R.IstopA && !R.atv) items.push({ g: 'stop', l: 'Arrêt d’urgence', t: R.IstopA * R.kt * R.i });
    const bar = x => { const p = x.t / R.t2b * 100, c = p > 100.05 || (R.t2not && x.t > R.t2not) ? 'crit' : p > m + 0.05 ? 'warn' : 'ok'; S.gstate[x.g] = c;
      return `<div class="gi" data-gk="${x.g}" tabindex="0"><span class="gl">${esc(x.l)}<span class="dep">${esc(GAUGES[x.g].dep)}</span></span><div class="track" role="img" aria-label="${fmt(p, 0)} % du T2B"><div class="fill ${c}" style="width:${Math.min(p, MAXP) / MAXP * 100}%"></div><div class="tick m" style="left:${m / MAXP * 100}%"></div><div class="tick" style="left:${100 / MAXP * 100}%"></div></div><span class="gv"><b>${fmt(x.t, 0)} Nm</b> · ${fmt(p, 0)} %</span></div>`; };
    gear = `<div class="sect"><div class="sect-h"><h3>Couple en sortie du réducteur</h3><span>T2B ${fmt(R.t2b, 0)} Nm${R.t2n ? ' · T2N ' + fmt(R.t2n, 0) : ''}${R.t2not ? ' · T2Not ' + fmt(R.t2not, 0) : ''}</span></div>
      <div class="gauge">${items.map(bar).join('')}<div class="gi"><span></span><div class="gscale"><span style="left:0;transform:none">0</span>${m < 92 ? `<span style="left:${m / MAXP * 100}%">${fmt(m, 0)} %</span>` : ''}<span style="left:${100 / MAXP * 100}%">T2B${m >= 92 && m < 99.5 ? ' (marge ' + fmt(m, 0) + ' %)' : ''}</span></div><span></span></div></div>
      <div class="glegend"><span><i style="background:var(--ok)"></i>sous ${fmt(m, 0)} % du T2B</span><span><i style="background:var(--warn)"></i>entre ${fmt(m, 0)} % et le T2B</span><span><i style="background:var(--crit)"></i>au-delà du T2B</span><span>Chaque case du formulaire prend la couleur de la jauge qu’elle fait bouger (la pire si elle en fait bouger plusieurs). Survole une barre pour voir ses cases.</span></div></div>`;
  }
  // Tableau : couples du réducteur traduits en courant moteur
  let ref = '';
  if (R.TR && R.TR.some(x => x.ref)) {
    const rows = R.TR.filter(x => x.ref || x.hl).map(x => {
      const over = R.Iref && x.I != null && x.I > R.Iref + 1e-9;
      return `<tr${x.hl ? ' class="hl"' : ''}><td>${esc(x.l)}</td><td>${x.t != null ? fmt(x.t, 1) : '—'}</td><td>${x.tm != null ? fmt(x.tm, 2) : '—'}</td><td>${x.I != null ? fmt(x.I, 2) : '—'}</td><td>${x.pc != null ? fmt(x.pc, 1) + ' %' : '—'}${over ? ' <b class="over" title="Le moteur ne peut pas fournir ce courant (au-delà de son Imax)">&gt; Imax</b>' : ''}</td></tr>`;
    }).join('');
    const noN = R.t2n ? '' : '<tr><td>T2N · couple nominal</td><td colspan="4" style="font-family:inherit;color:var(--muted)">non renseigné dans la fiche du réducteur</td></tr>';
    ref = `<div class="sect"><div class="sect-h"><h3>Limites du réducteur côté moteur</h3><span>Imax moteur ${R.Iref ? fmt(R.Iref, 1) + ' A' : '—'}</span></div>
      <div class="tscroll"><table class="reftab"><thead><tr><th></th><th>Couple sortie (Nm)</th><th>Couple moteur (Nm)</th><th>Courant (A)</th><th>% Imax</th></tr></thead><tbody>${noN}${rows}</tbody></table></div>
      <div class="glegend"><span>Courant moteur qui donne ce couple en sortie de réducteur (couple ÷ ratio ÷ Kt${R.integ ? ' ÷ rendement, réducteur intégré au moteur' : ''}). T2N = couple continu : le courant à ne pas dépasser en permanence (valeur efficace du cycle).</span></div></div>`;
  }
  const alerts = R.checks.filter(c => c[0] === 'crit' || c[0] === 'warn').concat(toolAlerts(S.draft, TT));
  const infos = R.checks.filter(c => c[0] === 'info');
  const acked = R.acked || [];
  const alertHtml = `<ul class="checks">${alerts.map(c => `<li class="${c[0]}"><span class="tag">${c[0] === 'crit' ? 'Danger' : 'Attention'}</span><span class="grow">${esc(c[1])}</span>${c[0] === 'warn' && c[2] !== 'tool' ? `<button type="button" class="btn ghost ackbtn" data-ack="${esc(ackKey(c))}" title="Marquer cette attention comme vue et acceptée : l’axe passe au vert, l’attention reste listée ici">Acquitter</button>` : ''}</li>`).join('')}
    ${!alerts.length ? `<li class="ok"><span class="tag">OK</span><span class="grow">Aucun problème détecté${acked.length ? ' · ' + acked.length + ' attention' + (acked.length > 1 ? 's' : '') + ' acquittée' + (acked.length > 1 ? 's' : '') : ''}.</span></li>` : ''}
    ${acked.map(c => `<li class="acked"><span class="tag">Acquitté</span><span class="grow">${esc(c[1])}<div class="ackmeta">le ${ackDate(c[2].date)}<input type="text" class="ackin" data-acknote="${esc(c[3])}" value="${esc(c[2].note || '')}" placeholder="motif (facultatif)" aria-label="Motif de l’acquittement"></div></span><button type="button" class="btn ghost ackbtn" data-unack="${esc(c[3])}" title="Remettre cette attention en orange">Annuler</button></li>`).join('')}</ul>`;
  const seg = (v, c) => R.Jtot > 0 ? `<div style="width:${Math.max(0, v / R.Jtot * 100)}%;background:var(${c})"></div>` : '';
  const kv = [['Courant limite', fmt(R.Ilim) + ' A'], R.vertical ? ['Courant de maintien', fmt(R.Ihold) + ' A'] : null, ['Accélération max', fmt(R.accMax, 0) + ' Units/s²'],
    ['Distance d’arrêt', R.dist ? fmt(R.dist, 1) + ' Units' : '—'], R.jerkMove ? ['Jerk du mouvement', fmt(R.jerkMove, 0) + ' Units/s³'] : null].filter(Boolean);
  const st = S.gstate.lim || 'none', pT = R.t2b && R.Tlim != null ? R.Tlim / R.t2b * 100 : null;
  const keyt = (cls, k, v, u, sub, extra = '') => `<div class="keyt st-${cls}${extra}"><span class="k">${k}</span><span class="v">${v}${u ? `<small>${u}</small>` : ''}</span><span class="s">${sub}</span></div>`;
  const keys = `<div class="keys">
    ${R.atv ? keyt(R.Ilim != null ? 'acc' : 'none', 'Limite de courant', R.pct != null ? fmt(R.pct, 1) : R.Ilim != null ? fmt(R.Ilim, 2) : '—', R.pct != null ? '%' : 'A', R.Ilim != null ? `CLI ${fmt(R.Ilim, 2)} A${R.Iref ? ' sur Imax ' + fmt(R.Iref, 1) + ' A (' + (R.refLim === 'atv' ? 'ATV320 ' + esc(R.drv.ref) : 'moteur' + (R.iDrv ? ', ATV ' + fmt(R.iDrv, 1) + ' A' : '')) + ')' : ''}${R.i0 ? ' · IN ' + fmt(R.i0, 2) + ' A' : ''}` : 'Imax moteur à renseigner')
      + keyt(R.Iacc == null ? 'none' : R.Iref && R.Iacc > R.Iref ? 'crit' : R.i0 && R.Iacc > R.i0 ? 'warn' : 'ok', 'Courant d’accélération', R.Iacc != null ? fmt(R.Iacc, 2) : '—', 'A', R.Iacc != null ? `pour ${fmt(R.acc, 0)} Units/s²${R.Iref ? ' · max ' + fmt(R.Iref, 1) + ' A' : ''}` : 'vitesse et accélération du cycle à saisir')
      + keyt(nMot == null ? 'none' : num(R.m.nMax) && nMot > num(R.m.nMax) ? 'crit' : num(R.m.nNom) && nMot > num(R.m.nNom) ? 'warn' : 'ok', 'HSP', R.hsp != null ? fmt(R.hsp, 1) : '—', 'Hz', nMot ? `${fmt(nMot, 0)} tr/min à Vmax · nominale ${R.fNom != null ? fmt(R.fNom, 0) + ' Hz' : '—'} · max ${R.fMax != null ? fmt(R.fMax, 0) + ' Hz' : '—'}` : 'vitesse du cycle à saisir' + (R.pp ? '' : ' · paires de pôles à renseigner'))
      + keyt(R.lsp == null || !R.pp ? 'none' : R.hsp != null && R.lsp > R.hsp ? 'warn' : 'ok', 'LSP', R.lsp != null && R.pp ? fmt(R.lsp, 1) : '—', 'Hz', num(S.draft.vMin) ? `${fmt(R.nAtVmin, 0)} tr/min à ${fmt(num(S.draft.vMin), 0)} Units/s` : 'pas de vitesse basse saisie : 0 Hz')
      + keyt(R.ith == null ? 'none' : R.ithPct > 100 ? 'warn' : 'ok', 'ITH', R.ith != null ? fmt(R.ith, 2) : '—', 'A', R.ith != null ? `${fmt(R.ithPct, 0)} % de IN (${fmt(R.i0, 2)} A)` : 'IN du moteur à renseigner')
    : keyt(R.pct != null ? 'acc' : 'none', 'UserCurrentLimit', R.pct != null ? fmt(R.pct, 1) : '—', '%', R.Iref ? `${fmt(R.Ilim)} A sur Imax ${fmt(R.Iref, 1)} A` : 'Imax moteur à renseigner')
    + keyt(vpR != null ? 'acc' : 'sugg', 'Vel_P_Gain', vpShow, '', vpSub)
    + keyt(viR != null ? 'acc' : 'sugg', 'Vel_I_Gain', viShow, '', viSub)}
    ${keyt(R.t2b ? st : 'none', 'Couple max réducteur', R.t2b ? fmt(R.t2b, 0) : '—', 'Nm', R.t2b ? `T2B · réglage : <b>${fmt(R.Tlim, 0)} Nm</b> (${fmt(pT, 0)} %)${R.t2not ? ` · T2Not ${fmt(R.t2not, 0)}` : ''}` : 'T2B à renseigner dans la fiche réducteur', ' g2')}
    ${keyt(R.t2n ? 'ok' : 'none', 'Couple nominal réducteur', R.t2n ? fmt(R.t2n, 0) : '—', 'Nm', R.t2n ? `T2N · réglage : <b>${fmt(R.Tlim, 0)} Nm</b> (${fmt(R.Tlim / R.t2n * 100, 0)} %)${R.I_T2N ? ` · T2N = ${fmt(R.I_T2N, 1)} A moteur` : ''}` : 'T2N non renseigné dans la fiche réducteur', ' g2')}
    ${keyt(R.ratioTot == null ? 'none' : R.ratioTot > 30 ? 'crit' : R.ratioTot > 10 ? 'warn' : 'ok', 'Rapport d’inertie', R.ratioTot != null ? fmt(R.ratioTot, R.ratioTot < 10 ? 1 : 0) : '—', '', 'charge ramenée ÷ (moteur + réducteur) · visé : 10 ou moins', ' g2')}
    ${keyt('acc', 'Inertie vue par le moteur', fmt(R.Jtot, 2), 'kg·cm²', `moteur ${fmt(R.Jm, 2)} · réducteur ${fmt(R.Jg, 2)} · charge ramenée ${fmt(R.JLm, 2)}`, ' g2')}
  </div>`;
  box.innerHTML = `<div class="panel-h"><div class="ph-t"><h2>${R.atv ? 'Données de l’axe · ' + (R.async ? 'asynchrone' : 'synchrone') + ' sur ATV320' : 'À saisir dans le variateur'}</h2><div class="el-sub">${R.atv ? (R.async ? 'Moteur asynchrone piloté par un ATV320 (loi vectorielle)' : 'Moteur synchrone (BMP, tambour NGI MTS62 ou Interroll DM) piloté par un ATV320 en loi SYN') + ' : rien à saisir dans Machine Expert, le variateur se règle en Modbus. Ici : limite de courant, HSP / LSP / ITH, tenue du réducteur, inertie et vitesse ; la plaque (' + (R.async ? 'NPR, UNS, NCR, FRS, NSP, COS' : 'NCRS, NSPS, PPNS, PHS') + ') est dans l’onglet ATV320.' : 'Rangé comme dans Machine Expert, dossier du variateur ' + esc('DRV_' + (S.draft.nom || '')) + ' : Mechanic, Control loop, General. Les jauges disent ce que le réducteur encaisse.'}</div></div><button class="btn" id="copyP" title="Copie la liste des paramètres et leurs valeurs (texte), à coller dans un mail ou un rapport">Copier</button></div>
  <div class="panel-b">
    ${keys}
    ${groups}
    ${gear}
    ${ref}
    ${alertHtml}
    <details class="calcd"><summary>Détail des calculs</summary><div class="calcbody">
      <div class="kv">${kv.map(x => `<div>${esc(x[0])}<b>${esc(x[1])}</b></div>`).join('')}</div>
      <div><h3 style="margin-bottom:6px">Inertie vue par le moteur · ${fmt(R.Jtot, 2)} kg·cm²</h3>
        <div class="ibar" role="img" aria-label="Répartition de l’inertie">${seg(R.Jm, '--seg-m')}${seg(R.Jg, '--seg-g')}${seg(R.JLm, '--seg-l')}</div>
        <div class="ilegend"><span><i style="background:var(--seg-m)"></i>Moteur ${fmt(R.Jm, 2)}</span><span><i style="background:var(--seg-g)"></i>Réducteur ${fmt(R.Jg, 2)}</span><span><i style="background:var(--seg-l)"></i>Charge ramenée au moteur ${fmt(R.JLm, 2)}</span></div>
        <div class="muted" style="font-size:12px;margin-top:6px">Répartition seulement, ce n’est pas une alerte. Rapport d’inertie charge / (moteur + réducteur) : <b style="color:var(--fg)">${fmt(R.ratioTot, 1)}</b>${R.ratioTot != null ? (R.ratioTot > 30 ? ' : très élevé.' : R.ratioTot > 10 ? ' : élevé, monter les gains par petites étapes.' : ' : correct.') : ''}</div></div>
      ${R.gainFactor ? `<div class="muted" style="font-size:12px">Vel_P_Gain transposé : ${fmt(num(S.draft.velPActuel), 2)} × ${fmt(R.gainFactor, 3)} = ${fmt(R.velPTransp, 1)} (inertie déclarée ${fmt(R.Jold, 2)} → ${fmt(R.Jtot, 2)} kg·cm²).</div>` : ''}
      <div class="calc">${R.calc.map(c => `<div>${esc(c[0])} = <b>${fmt(c[1], 4)}</b> ${esc(c[2])} <span class="c">· ${esc(c[3])}</span></div>`).join('')}</div>
      ${infos.length ? `<ul class="checks">${infos.map(c => `<li class="info"><span class="tag">À voir</span><span>${esc(c[1])}</span></li>`).join('')}</ul>` : ''}
    </div></details>
  </div>`;
  linkGauges(); renderToolResults(TT);
  box.querySelectorAll('[data-ack]').forEach(b => { b.onclick = () => setAck(b.dataset.ack, { date: Date.now(), note: '' }); });
  box.querySelectorAll('[data-unack]').forEach(b => { b.onclick = () => setAck(b.dataset.unack, null); });
  box.querySelectorAll('[data-acknote]').forEach(i => { i.onchange = () => { const cur = (S.draft.acquit || {})[i.dataset.acknote]; if (cur) setAck(i.dataset.acknote, { ...cur, note: i.value.trim() }); }; });
  $('#copyP').onclick = async (e) => {
    const txt = `Axe ${S.draft.nom || ''}\n` + P.map(p => `${p[0]} = ${p[1]}`).join('\n');
    try { await navigator.clipboard.writeText(txt); e.target.textContent = 'Copié'; setTimeout(() => { e.target.textContent = 'Copier'; }, 1500); }
    catch { e.target.textContent = 'Copie refusée'; }
  };
}

/* Acquitter une attention : enregistré tout de suite sur l'axe (et dans la fiche en cours) */
async function setAck(key, val) {
  const acq = { ...(S.draft.acquit || {}) }; if (val) acq[key] = val; else delete acq[key];
  S.draft.acquit = acq;
  const a = S.draft.id ? S.axes.find(x => x.id === S.draft.id) : null;
  if (a) { try { await writeDoc('axes', a.id, { ...strip(a), acquit: acq }); } catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); return; } }
  else { S.dirty = true; updateDirty(); }
  setStatus(val ? (val.note != null && Object.keys(val).length > 1 && val.note ? 'Motif enregistré.' : 'Attention acquittée : l’axe est compté comme réglé. Elle reste listée, en gris.') : 'Attention remise en orange.');
  renderAxes();
}
function glow(keys, on) {
  if (!keys) return;
  keys.split(' ').forEach(k => {
    document.querySelectorAll(`#axisForm .field[data-g~="${k}"]`).forEach(el => el.classList.toggle('glow', on));
    document.querySelectorAll(`#results .gi[data-gk="${k}"]`).forEach(el => el.classList.toggle('glow', on));
  });
}
const RANK = { ok: 1, warn: 2, crit: 3 };
function colorFields() {
  document.querySelectorAll('#axisForm .field[data-g]').forEach(f => {
    let worst = null;
    f.dataset.g.split(' ').forEach(k => { const st = S.gstate && S.gstate[k]; if (st && (!worst || RANK[st] > RANK[worst])) worst = st; });
    f.classList.remove('g-ok', 'g-warn', 'g-crit');
    if (worst) f.classList.add('g-' + worst);
    const lab = f.querySelector('label');
    if (lab) lab.title = 'Fait bouger : ' + f.dataset.g.split(' ').map(k => GAUGES[k].l).join(', ');
  });
}
function linkGauges() {
  colorFields();
  document.querySelectorAll('#results .gi[data-gk]').forEach(gi => {
    const k = gi.dataset.gk;
    gi.onmouseenter = gi.onfocus = () => glow(k, true);
    gi.onmouseleave = gi.onblur = () => glow(k, false);
  });
  // la case en cours de saisie garde sa jauge en surbrillance après chaque recalcul
  const f = document.activeElement && document.activeElement.closest && document.activeElement.closest('#axisForm .field[data-g]');
  if (f) glowField(f, true);
}
function glowField(f, on) {
  f.classList.toggle('glow', on);
  f.dataset.g.split(' ').forEach(k => document.querySelectorAll(`#results .gi[data-gk="${k}"]`).forEach(el => el.classList.toggle('glow', on)));
}
/* ---------- Champ moteur / réducteur : taper la référence pour filtrer ---------- */
const norm = t => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function comboItems(type, q) {
  const list = type === 'motor' ? S.motors : S.reducers;
  const toks = norm(q).split(/\s+/).filter(Boolean);
  if (!toks.length) return list;
  return list.filter(x => {
    const w = norm([x.ref, x.serie, x.marque].join(' ')).split(/[\s()·]+/).filter(Boolean);
    if (x.ratio != null) { const r = String(num(x.ratio)); w.push(r, r.replace('.', ','), 'i=' + r, 'i=' + r.replace('.', ',')); }
    w.slice().forEach(v => { if (/^0+\d/.test(v)) w.push(v.replace(/^0+/, '')); });
    const pairs = w.slice(0, -1).map((v, n) => v + w[n + 1]);
    const flat = norm(x.ref).replace(/[\s\-_/.,()]/g, '');
    return toks.every(t => t.startsWith('i=') ? (w.includes(t) || w.includes(t.replace(',', '.'))) : (w.some(v => v.startsWith(t)) || pairs.some(v => v.startsWith(t)) || (t.length >= 4 && flat.includes(t))));
  });
}
function comboSub(type, x) {
  return type === 'motor'
    ? (x.typeMot === 'async' ? ['Async.' + (x.tension ? ' ' + x.tension : ''), num(x.imax) != null ? 'Imax ' + fmt(num(x.imax), 1) + ' A' : ''] : [num(x.kt) ?? (num(x.m0) && num(x.i0) ? num(x.m0) / num(x.i0) : null), num(x.imax)].map((v, i) => v == null ? '' : (i ? 'Imax ' + fmt(v, 1) + ' A' : 'Kt ' + fmt(v, 3)))).filter(Boolean).join(' · ')
    : ['i=' + fmt(num(x.ratio), 3), x.t2b != null ? 'T2B ' + fmt(num(x.t2b), 0) + ' Nm' : 'T2B ?'].join(' · ');
}
function bindCombos() {
  if (!S.comboDoc) { S.comboDoc = true; document.addEventListener('pointerdown', e => { document.querySelectorAll('.combo').forEach(c => { if (!c.contains(e.target) && c._close) c._close(); }); }); }
  document.querySelectorAll('#axisForm .combo').forEach(box => {
    const type = box.dataset.combo, k = box.dataset.ck, inp = box.querySelector('input'), lst = box.querySelector('.combo-list');
    const list = type === 'motor' ? S.motors : S.reducers;
    const label = () => list.find(x => x.id === S.draft[k])?.ref || '';
    let items = [], act = -1;
    const draw = q => {
      items = comboItems(type, q);
      if (!items.length) { lst.innerHTML = `<div class="cempty">Aucune référence ne correspond. Ajoute-la dans l’onglet ${type === 'motor' ? 'Moteurs' : 'Réducteurs'}.</div>`; act = -1; return; }
      const curId = S.draft[k]; act = Math.max(0, items.findIndex(x => x.id === curId)); if (q) act = 0;
      let h = '', last = null;
      items.forEach((x, n) => { const g = x.serie || 'Autres'; if (g !== last) { h += `<div class="cgrp">${esc(g)}</div>`; last = g; }
        h += `<div class="copt${x.id === curId ? ' cur' : ''}" role="option" id="${inp.id}-o${n}" data-n="${n}" aria-selected="${n === act}"><b>${esc(x.ref)}</b><small>${esc(comboSub(type, x))}</small></div>`; });
      lst.innerHTML = h; mark();
    };
    const mark = () => { lst.querySelectorAll('.copt').forEach(o => o.setAttribute('aria-selected', String(+o.dataset.n === act))); const a = lst.querySelector(`[data-n="${act}"]`); if (a) { inp.setAttribute('aria-activedescendant', a.id); a.scrollIntoView({ block: 'nearest' }); } };
    const open = q => { draw(q); lst.hidden = false; inp.setAttribute('aria-expanded', 'true'); };
    const close = () => { lst.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.removeAttribute('aria-activedescendant'); };
    const pick = x => { close(); if (!x) { inp.value = label(); return; } if (S.draft[k] !== x.id) { S.draft[k] = x.id; S.dirty = true; S.justSaved = false; renderAxes(); const n = document.getElementById(inp.id); if (n) { S.comboSkip = inp.id; n.focus(); } } else inp.value = label(); };
    inp.addEventListener('focus', () => { inp.select(); if (S.comboSkip === inp.id) { S.comboSkip = null; return; } open(''); });
    inp.addEventListener('click', () => { if (lst.hidden) open(''); });
    inp.addEventListener('input', () => open(inp.value));
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (lst.hidden) open(''); if (items.length) { act = (act + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; mark(); } }
      else if (e.key === 'Enter') { if (!lst.hidden) { e.preventDefault(); pick(items[act]); } }
      else if (e.key === 'Escape') { if (!lst.hidden) { e.preventDefault(); close(); inp.value = label(); } }
      else if (e.key === 'Tab') { close(); inp.value = label(); }
    });
    box._close = () => { if (!lst.hidden) { close(); inp.value = label(); } };
    lst.addEventListener('mousedown', e => { if (e.target.closest('.copt')) e.preventDefault(); });
    lst.addEventListener('click', e => { const o = e.target.closest('.copt'); if (o) pick(items[+o.dataset.n]); });
  });
}
function feedPh() {
  const f = document.getElementById('ax-feed'); if (!f || !S.draft) return;
  const D = S.draft.typeCharge === 'convoyeur' ? num(S.draft.dRouleau) : null;
  f.placeholder = D ? fmt(Math.round(Math.PI * D * 1000) / 1000, 3) : '';
}
function bindAxes() {
  feedPh();
  document.querySelectorAll('[data-axis]').forEach(b => b.onclick = () => {
    if (S.dirty && !b.dataset.force) { b.dataset.force = '1'; setStatus('Modifications non enregistrées : clique à nouveau sur l’axe pour les abandonner.'); return; }
    setStatus(''); S.axisId = b.dataset.axis; S.dirty = false; S.justSaved = false; S.draft = { ...pAxes().find(a => a.id === S.axisId) }; render();
  });
  const newAxis = () => { S.draft = { _new: true, nom: '', typeCharge: 'lineaire', marge: 80, tStop: 0.2 }; S.dirty = true; S.justSaved = false; render(); setTimeout(() => { const i = $('#ax-nom'); if (i) i.focus(); }, 0); };
  const nb = $('#newAxis'); if (nb) nb.onclick = newAxis;
  const ea = $('#emptyAxis'); if (ea) ea.onclick = newAxis;
  const ee = $('#emptyElec'); if (ee) ee.onclick = () => { const f = $('#elecFile'); if (f) f.click(); };
  const ep = $('#emptyProj'); if (ep) ep.onclick = () => { const b = $('#projNew'); if (b) b.click(); };
  const eh = $('#emptyHelp'); if (eh) eh.onclick = () => toggleHelp(true);
  const form = $('#axisForm'); if (!form) return;
  bindCombos(); bindTools(form);
  form.addEventListener('focusin', e => { const f = e.target.closest('.field[data-g]'); if (f) glowField(f, true); });
  form.addEventListener('focusout', e => { const f = e.target.closest('.field[data-g]'); if (f) glowField(f, false); });
  form.addEventListener('mouseover', e => { const f = e.target.closest('.field[data-g]'); if (f && !f.contains(e.relatedTarget)) glowField(f, true); });
  form.addEventListener('mouseout', e => { const f = e.target.closest('.field[data-g]'); if (f && !f.contains(e.relatedTarget) && !f.contains(document.activeElement)) glowField(f, false); });
  form.addEventListener('input', e => { const el = e.target; if (!el.dataset.k) return; S.draft[el.dataset.k] = readInput(el); S.dirty = true; S.justSaved = false; updateDirty(); if (el.dataset.k === 'dRouleau') feedPh(); renderResults(); });
  form.addEventListener('change', e => { const el = e.target; if (!el.dataset.k) return; S.draft[el.dataset.k] = readInput(el); S.dirty = true; if (el.dataset.k === 'typeCharge' || el.dataset.k === 'reducteurId') { renderAxes(); const n = document.getElementById(el.id); if (n) n.focus(); } else { updateDirty(); renderResults(); } });
  const st = $('#saveAxisTop'); if (st) st.onclick = () => $('#saveAxis').click();
  $('#saveAxis').onclick = async () => {
    const d = { ...S.draft, projetId: S.projId }; const isNew = d._new; delete d._new;
    if (!d.nom) { setStatus('Donne un nom à l’axe avant d’enregistrer.', true); return; }
    const id = isNew ? newId('axes') : d.id; delete d.id;
    try { S.axisId = id; S.dirty = false; S.justSaved = true; S.draft = { id, ...d }; await writeDoc('axes', id, d); setStatus(''); updateDirty(); render(); }
    catch (e) { S.dirty = true; setStatus('Enregistrement impossible : ' + (e.message || e.code), true); }
  };
  const cancel = $('#cancelAxis'); if (cancel) cancel.onclick = () => { S.dirty = false; S.draft = null; onData(); };
  const dup = $('#dupAxis'); if (dup) dup.onclick = () => { const c = { ...S.draft, _new: true, nom: (S.draft.nom || '') + ' (copie)' }; delete c.id; S.draft = c; S.dirty = true; render(); };
  const del = $('#delAxis'); if (del) del.onclick = async () => {
    if (!del.classList.contains('armed')) { del.classList.add('armed', 'danger'); del.textContent = 'Confirmer la suppression'; return; }
    try { const id = S.draft.id; S.draft = null; S.axisId = null; S.dirty = false; await deleteDoc('axes', id); }
    catch (e) { setStatus('Suppression impossible : ' + (e.message || e.code), true); }
  };
}

/* key = collection ; typ (moteurs seulement) = 'sync' (onglet Brushless) ou 'async' (onglet Asynchrones) : même collection, deux listes */
function renderLib(key, typ) {
  const v = $('#view'); if (!allLoaded()) { v.innerHTML = ''; return; }
  const isM = key === 'motors', isH = key === 'hwtypes', isD = key === 'drives', FIELDS = isM ? MOTOR_FIELDS : isH ? HWTYPE_FIELDS : isD ? DRIVE_FIELDS : REDUCER_FIELDS;
  const typ2 = isM ? (typ || 'sync') : null, isA = typ2 === 'async', sk = isA ? 'asyncs' : key;   // sk : clé des filtres (recherche, série) propre à chaque onglet
  const noun = isA ? 'moteur asynchrone' : isM ? 'moteur brushless' : isH ? 'type de matériel' : isD ? 'variateur' : 'réducteur';
  S.marque = S.marque || {};
  const q = (S.search[sk] || '').toLowerCase().trim(), ser = S.serie[sk] || '', mq = isM || isH || isD ? '' : (S.marque[sk] || '');
  const words = q.split(/\s+/).filter(Boolean);
  const pool = isM ? S.motors.filter(x => (x.typeMot === 'async') === isA) : S[key];
  const brands = isM || isH || isD ? [] : [...new Set(pool.map(x => x.marque || 'Autres'))].sort((a, b) => a.localeCompare(b, 'fr'));
  const inBrand = pool.filter(x => !mq || (x.marque || 'Autres') === mq);
  const series = [...new Set(inBrand.map(x => x.serie || 'Autres'))];
  const hay = x => isH ? [x.ref, x.serie, x.alias, x.devId, x.parent, x.notes, hwNomAuto(x.ref)].join(' ').toLowerCase() : isD ? [x.ref, x.serie, x.tension, x.puissance != null ? x.puissance + ' kw' : '', x.notes].join(' ').toLowerCase() : [x.ref, x.serie, x.marque, x.ratio != null ? 'i=' + x.ratio + ' i=' + String(x.ratio).replace('.', ',') : '', x.pNom != null ? x.pNom + ' kw ' + String(x.pNom).replace('.', ',') + ' kw' : '', x.typeMot === 'async' ? 'asynchrone' : x.typeMot === 'sync' || isM ? 'synchrone' : ''].join(' ').toLowerCase();
  const list = inBrand.filter(x => (!ser || (x.serie || 'Autres') === ser) && (!words.length || (h => words.every(w => h.includes(w)))(hay(x))));
  const cols = isD ? [['Puissance', x => x.puissance != null ? fmt(num(x.puissance), 2) : '', 'kW'], ['In', x => fmt(num(x.iNom), 1), 'A'], ['Imax', x => fmt(num(x.iPeak), 1), 'A'], ['Tension', x => esc(x.tension || ''), '']] : isH ? [['Nom dans l’automate', x => `<span class="mono">${esc(hwNomAuto(x.ref))}</span>`, ''], ['DeviceID', x => esc([x.devType, x.devId].filter(v => v != null && v !== '').join(' / ')), ''], ['Version', x => esc(x.devVer || ''), ''], ['Parent', x => esc(x.parent || ''), '']] : isM
    ? (isA ? [['Puissance', x => num(x.pNom) != null ? fmt(num(x.pNom), 2) : '', 'kW'], ['IN', x => fmt(num(x.i0), 2), 'A'], ['Vitesse', x => num(x.nNom) != null ? fmt(num(x.nNom), 0) : '', 'tr/min'], ['cos φ', x => num(x.cosPhi) != null ? fmt(num(x.cosPhi), 2) : '', ''], ['Tension', x => esc(x.tension || ''), '']]
      : [['Kt', x => fmt(num(x.kt) ?? (num(x.m0) / num(x.i0)), 3), 'Nm/A'], ['Inertie', x => fmt(num(x.jMotor), 3), 'kg·cm²'], ['IN / I0', x => fmt(num(x.i0), 2), 'A'], ['Imax', x => fmt(num(x.imax), 1), 'A'], ['Vitesse', x => num(x.nNom) != null ? fmt(num(x.nNom), 0) : '', 'tr/min']])
    : [['i', x => fmt(num(x.ratio), 3), ''], ['T2B', x => fmt(num(x.t2b), 0), 'Nm'], ['J_Gear', x => fmt(num(x.jGear), 3), 'kg·cm²']];
  const used = id => isH ? (t => S.projects.filter(p => (p.materiel || []).some(m => m.type === t)).map(p => p.nom))((S[key].find(x => x.id === id) || {}).ref) : isD ? S.axes.filter(a => a.variateur && driveOf(a.variateur)?.id === id).map(a => (projName(a.projetId) ? projName(a.projetId) + ' › ' : '') + a.nom) : S.axes.filter(a => (isM ? a.moteurId : a.reducteurId) === id).map(a => (projName(a.projetId) ? projName(a.projetId) + ' › ' : '') + a.nom);
  let ed = S.lib[key];
  if (isM && ed && ed.id && ((ed.typeMot === 'async') !== isA)) ed = null;   // fiche de l'autre onglet : pas ici
  let body = '', last = null;
  list.forEach(x => {
    const g = x.serie || 'Autres';
    if (g !== last) { body += `<tr class="grp"><td colspan="${cols.length + 2}">${esc(g)}</td></tr>`; last = g; }
    body += `<tr class="row ${ed && ed.id === x.id ? 'sel' : ''}" data-edit="${esc(x.id)}"><td><button class="linkbtn" data-edit="${esc(x.id)}">${esc(x.ref)}</button></td>${cols.map(c => `<td class="n">${c[1](x)}</td>`).join('')}<td class="used">${esc(used(x.id).join(', '))}</td></tr>`;
  });
  const table = list.length ? `<div class="tblwrap"><table><thead><tr><th>Référence</th>${cols.map(c => `<th class="n">${c[0]}${c[2] ? ` <span style="text-transform:none;letter-spacing:0">${c[2]}</span>` : ''}</th>`).join('')}<th>Utilisé par</th></tr></thead><tbody>${body}</tbody></table></div>`
    : `<div class="empty"><b>Aucun résultat</b><span>${q || ser ? 'Rien ne correspond à ce filtre.' : 'Clique sur « + Ajouter » pour créer le premier ' + noun + '.'}</span></div>`;
  const form = ed ? `<section class="panel edit sticky"><div class="panel-h"><h2>${ed.id ? esc(ed.ref || '') : 'Nouveau ' + noun}</h2><button class="btn ghost" id="libCancel">Fermer</button></div>
    <div class="panel-b" id="libForm"><fieldset>${FIELDS.filter(f => !f.only || f.only === (ed.typeMot || 'sync')).map(f => inputHtml(isM && ed.typeMot === 'async' && (f.la || f.ha) ? { ...f, l: f.la || f.l, h: f.ha || f.h } : f, f.k === 'integre' ? isIntegre(ed) : ed[f.k], 'lib-')).join('')}</fieldset>
    <div class="actions"><button class="btn primary" id="libSave">${ed.id ? 'Enregistrer' : 'Ajouter'}</button>${ed.id ? `<button class="btn ghost" id="libDup">Dupliquer</button>${ed._cat ? '' : `<button class="btn ghost ${S.confirm === ed.id ? 'danger armed' : ''}" id="libDel">${S.confirm === ed.id ? 'Confirmer la suppression' : 'Supprimer'}</button>`}` : ''}</div></div></section>` : '';
  v.innerHTML = `<div class="panel" style="padding:10px 12px"><div class="libbar"><div class="inp text"><input id="libSearch" placeholder="${isH ? 'Rechercher : type, famille, référence du dossier…' : isA ? 'Rechercher : référence, fabricant, 0,75 kw…' : 'Rechercher : référence, i=7…'}" value="${esc(S.search[sk] || '')}" autocomplete="off"></div>
      ${isM || isH || isD ? '' : `<select id="libMarque" aria-label="Marque"><option value="">Toutes les marques</option>${brands.map(g => `<option ${g === mq ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>`}
      <select id="libSerie" aria-label="Série"><option value="">${isH ? 'Toutes les familles' : 'Toutes les séries'} (${inBrand.length})</option>${series.map(g => `<option ${g === ser ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>
      ${isH ? '<label class="btn" for="meJson" style="cursor:pointer" title="Fichier explo_materiel.json du script explorer_materiel.py">Importer depuis Machine Expert</label><input type="file" id="meJson" accept=".json,application/json" hidden>' : ''}<button class="btn primary" id="libNew">+ Ajouter</button>
      <div class="libnote">${isD ? 'Fiches variateurs : courant nominal In et courant max Imax, communes à tous les projets. Une référence du dossier (ATV320U06N4C, LXM62DU60C21000) est rattachée à la fiche dont la référence est le début de la sienne. Pour un axe BMP, l’Imax de l’ATV320 borne la limite de courant ; pour un Lexium 62, c’est le moteur qui fait référence (MaxDrivePeakCurrent à vérifier). « Utilisé par » = axes dont le variateur est rattaché à cette fiche.' : isH ? 'Chaque type dit au script comment créer l’appareil dans Machine Expert : DeviceID (type, identifiant, version), module et parent dans l’arbre. « Nom dans l’automate » = modèle du nom donné à l’appareil dans Machine Expert ({dossier} = nom du dossier élec, {n} = n° d’ordre, {ilot} = n° d’îlot TM5). Les fiches intégrées viennent du dictionnaire de l’Auto_Pannel ; « Importer depuis Machine Expert » lit les DeviceID d’un projet existant avec explorer_materiel.py. « Utilisé par » = projets où ce type apparaît.' : isA ? 'Moteurs asynchrones (fichier catalogue/moteurs_asynchrones.js), communs à tous les projets : la plaque (puissance, tension, IN, fréquence, vitesse, cos φ) donne les paramètres NPR, UNS, NCR, FRS, NSP, COS et ITH de l’ATV320, affichés dans l’onglet ATV320 du projet. Mets la puissance dans la référence (« LSES 90 LU 1,5 kW ») quand le type seul ne suffit pas, pour qu’une référence du dossier commençant pareil soit rattachée à la bonne fiche. L’import du dossier élec ne crée les fiches absentes qu’avec la référence et le fabricant : les données constructeur se saisissent depuis le catalogue ou la plaque, jamais depuis le dossier (qui peut se tromper ; l’écart est signalé dans l’onglet ATV320). Catalogue livré : SEW DRN (IE3, 2 / 4 / 6 / 8 pôles), Leroy-Somer LSES (IE3), Interroll DM 0080. Clique sur une référence pour la voir ; le bouton ? dit où trouver chaque valeur.' : isM ? 'Moteurs synchrones (fichier catalogue/moteurs_brushless.js), communs à tous les projets : Kt, inertie et courants servent aux calculs des axes (Lexium 62) ; pour un synchrone sur ATV320 (BMP, tambour NGI MTS62 ou Interroll DM) s’ajoutent les paires de pôles et la constante ke (PHS). Le catalogue livré (Schneider SH3 / ILM / BMP, NGI, Interroll) se complète ou se corrige, une fiche modifiée est gardée à la mise à jour du catalogue. Clique sur une référence pour la voir ; le bouton ? dit où trouver chaque valeur.' : 'Fiches réducteurs communes à tous les projets : rapport, couples T2B / T2N / T2Not et J_Gear servent aux calculs. Pour SEW, GearIn / GearOut exacts viennent du tableau des dents. Clique sur une référence pour la voir ; le bouton ? dit où trouver chaque valeur.'}</div></div></div>
    ${isH ? meImpPanel() : ''}<div class="libgrid ${ed ? 'editing' : ''}" style="margin-top:14px"><section class="panel">${table}</section>${form}</div>`;
  const ls = $('#libSearch'); ls.oninput = () => { S.search[sk] = ls.value; const pos = ls.selectionStart; render(); const n = $('#libSearch'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} };
  $('#libSerie').onchange = e => { S.serie[sk] = e.target.value; render(); };
  const lm = $('#libMarque'); if (lm) lm.onchange = e => { S.marque[sk] = e.target.value; S.serie[sk] = ''; render(); };
  $('#libNew').onclick = () => { S.lib[key] = isM ? { typeMot: typ2 } : {}; S.confirm = null; render(); };
  v.querySelectorAll('tr[data-edit]').forEach(b => b.onclick = () => { S.lib[key] = { ...S[key].find(x => x.id === b.dataset.edit) }; S.confirm = null; render(); });
  if (isH) bindMeImp();
  if (!ed) return;
  const lf = $('#libForm');
  if (isH && ['Variateur Sercos', 'Carte IO', 'Codeur'].includes(ed.serie || HW_FAM0(ed.ref || ''))) { const i = $('#lib-nomAuto'); if (i) { i.readOnly = true; i.title = 'Fixé par le script : DRV_, IO_, LE_ + repère de l’axe'; } }
  const sync = e => { const el = e.target; if (!el.dataset.k) return; S.lib[key] = { ...(S.lib[key] || {}), [el.dataset.k]: readInput(el) }; if (el.dataset.k === 'typeMot' && e.type === 'change') render(); };
  lf.addEventListener('input', sync); lf.addEventListener('change', sync);
  $('#libCancel').onclick = () => { S.lib[key] = null; S.confirm = null; render(); };
  $('#libSave').onclick = async () => {
    const d = { ...(S.lib[key] || {}) };
    if (!d.ref) { setStatus('La référence est obligatoire.', true); return; }
    if (!isM && !isH && !isD && !num(d.ratio)) { setStatus('Le rapport de réduction est obligatoire.', true); return; }
    if (isH && (num(d.devType) == null || !d.devId || !d.devVer || !d.parent)) { setStatus('Type, identifiant et version du DeviceID, et parent, sont obligatoires.', true); return; }
    if (isD && num(d.iPeak) == null) { setStatus('Le courant max (Imax) est obligatoire.', true); return; }
    if (isH) { d.ref = String(d.ref).trim(); delete d._cat; }
    const id = d.id || newId(key); delete d.id;
    try { await writeDoc(key, id, d); S.lib[key] = null; setStatus(''); render(); } catch (e) { setStatus('Enregistrement impossible : ' + (e.message || e.code), true); }
  };
  const dup = $('#libDup'); if (dup) dup.onclick = () => { const c = { ...S.lib[key], ref: (S.lib[key].ref || '') + ' (copie)' }; delete c.id; S.lib[key] = c; S.confirm = null; render(); };
  const del = $('#libDel'); if (del) del.onclick = async () => {
    const id = ed.id, u = used(id);
    if (u.length) { setStatus(`Impossible de supprimer : utilisé par ${u.join(', ')}. Change d’abord ${u.length > 1 ? 'ces axes' : 'cet axe'}.`, true); return; }
    if (S.confirm !== id) { S.confirm = id; render(); return; }
    S.confirm = null; try { await deleteDoc(key, id); S.lib[key] = null; setStatus(''); render(); } catch (e) { setStatus('Suppression impossible : ' + (e.message || e.code), true); }
  };
}

/* Barre d'onglets : le groupe de l'onglet actif est déplié, l'autre est un menu déroulant */
const TAB_GROUPS = [
  { k: 'projet', l: 'Projet', tabs: [['axes', 'Axes', 'Réglage de chaque axe : moteur, réducteur, charge → valeurs à saisir dans le variateur'], ['brushless', 'Brushless', 'Variateurs Lexium 62 : ordre Sercos, LXM62 / ILM62, codeur, carte IO'], ['atv', 'ATV320', 'Variateurs ATV320 sur CANopen : Node-ID, Optional device, paramètres'], ['es', 'E/S', 'Entrées / sorties du projet : désignations du dossier et noms des variables automate']] },
  { k: 'catalogue', l: 'Catalogue', tabs: [['motors', 'Brushless', 'Moteurs synchrones (SH3 / ILM, BMP, tambours synchrones) : Kt, inertie, courants'], ['asyncs', 'Asynchrones', 'Moteurs asynchrones (sur ATV320 ou direct réseau) : plaque (puissance, IN, vitesse, cos φ)'], ['reducers', 'Réducteurs', 'Fiches réducteurs (rapport, T2B, J_Gear), communes à tous les projets'], ['hwtypes', 'Matériel', 'Types d’appareils que le script sait créer dans Machine Expert (DeviceID)'], ['drives', 'Variateurs', 'Fiches variateurs : In et Imax des ATV320 et des Lexium 62'], ['iodict', 'Dictionnaire E/S', 'Mots du dossier → noms des variables automate (vérin → V, monter → raisingUp…)']] }
];
/* Ligne 1 : Projet | Catalogue. Ligne 2 : les onglets de la section active. */
const grpOf = tab => TAB_GROUPS.find(g => g.tabs.some(t => t[0] === tab)) || TAB_GROUPS[0];
function renderNav() {
  const nav = $('#tabs'), sub = $('#subtabs'); if (!nav || !sub) return;
  const g = grpOf(S.tab);
  nav.innerHTML = TAB_GROUPS.map(x => `<button class="tab sec" data-sec="${x.k}" aria-pressed="${x.k === g.k}" aria-selected="${x.k === g.k}" title="${esc(x.tabs.map(t => t[1]).join(' · '))}">${esc(x.l)}</button>`).join('')
    + `<button class="tab help" id="helpBtn" aria-expanded="${!$('#helpbox').hidden}" aria-controls="helpbox" title="Comment ça marche">? Aide</button>`;
  sub.innerHTML = g.tabs.map(([k, l, t]) => `<button class="tab" role="tab" id="tab-${k}" data-tab="${k}" aria-selected="${k === S.tab}" title="${esc(t)}">${esc(l)}</button>`).join('');
  $('#helpBtn').onclick = () => toggleHelp();
}
const goTab = t => { S.tab = t; S.confirm = null; try { localStorage.setItem('servo-tab', S.tab); } catch (e) {} render(); };
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('[data-sec]'); if (!b) return;
  const g = TAB_GROUPS.find(x => x.k === b.dataset.sec); if (!g || g.tabs.some(t => t[0] === S.tab)) return;
  /* on revient dans la section sur son dernier onglet visité */
  goTab((S.lastTab && S.lastTab[g.k]) || g.tabs[0][0]);
});
$('#subtabs').addEventListener('click', e => { const b = e.target.closest('.tab[data-tab]'); if (b) goTab(b.dataset.tab); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && !e.altKey && String(e.key).toLowerCase() === 's') { const b = $('#saveAxis'); if (b && S.tab === 'axes' && S.draft) { e.preventDefault(); const ae = document.activeElement; if (ae && ae.blur) ae.blur(); if (S.dirty) b.click(); } }
});
function toggleHelp(on) {
  const h = $('#helpbox'), b = $('#helpBtn'); if (!h) return;
  h.hidden = on == null ? !h.hidden : !on; if (b) b.setAttribute('aria-expanded', String(!h.hidden));
  try { localStorage.setItem('servo-help', h.hidden ? '0' : '1'); } catch (e) {}
  if (!h.hidden) h.scrollIntoView({ block: 'nearest' });
}
$('#helpClose').onclick = () => toggleHelp(false);
try { const t = localStorage.getItem('servo-tab'); if (t && ['axes', 'brushless', 'atv', 'es', 'motors', 'asyncs', 'reducers', 'hwtypes', 'drives', 'iodict'].includes(t)) S.tab = t; } catch (e) {}
renderNav();
try { if (localStorage.getItem('servo-help') === '1') toggleHelp(true); } catch (e) {}

(async () => {
  let db = null;
  try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
  S.db = db;
  if (window.claude && window.claude.use) window.claude.use('downloads').then(d => { S.dl = d || null; if (d) render(); }).catch(() => {});
  if (!db) {
    let base = null, seed = null, added = 0;
    try { base = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'); } catch (e) {}
    seed = window.CATALOGUE && Object.keys(window.CATALOGUE).some(k => Array.isArray(window.CATALOGUE[k])) ? window.CATALOGUE : null;   // catalogue/*.js
    if (!base) { loadBase(seed); S.seedVersion = seed?._version || null; S.seedHashes = seed ? seedHashesOf(seed) : null; if (seed) saveLocal(); }
    else {
      loadBase(base); S.seedVersion = base._seedVersion || null; S.seedHashes = base._seedHashes || null;
      // Nouvelle version du fichier : ajoute les moteurs/réducteurs/variateurs du catalogue absents de la base locale (sans toucher à tes modifications)
      if (seed?._version && seed._version !== S.seedVersion) syncSeed(seed, false);
    }
    const info = () => { const el = $('#seedInfo'); if (el) el.textContent = 'Catalogue ' + (S.seedVersion || '—') + ' · ' + S.reducers.filter(x => !x._cat).length + ' réducteurs'; };
    S.seedInfo = info; info();
    $('#updCat').onclick = () => { if (!seed) { setStatus('Pas de catalogue dans ce fichier.', true); return; } syncSeed(seed, true); render(); };
    $('#expBase').onclick = () => {
      const blob = new Blob([JSON.stringify(Object.fromEntries(KEYS.map(k => [k, S[k]])), null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'base-reglages-servo-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    $('#impBase').onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      try { const o = JSON.parse(await f.text()); if (!KEYS.some(k => Array.isArray(o[k]))) throw new Error('fichier non reconnu');
        loadBase(o); S.projId = null; S.axisId = null; S.draft = null; S.dirty = false; saveLocal(); setStatus('Base importée : ' + S.motors.length + ' moteurs, ' + S.reducers.length + ' réducteurs, ' + S.axes.length + ' axes.'); onData(); }
      catch (err) { setStatus('Import impossible : ' + err.message, true); }
    };
    onData(); return;
  }
  /* page Claude (base partagée) : « Exporter la base » donne un .json à reprendre dans la version GitHub / hors ligne (« Importer une base ») */
  const lb = $('#localbar');
  if (lb) {
    lb.innerHTML = '<span><b>Page Claude</b> · la base (projets, axes, catalogues) est partagée dans cette page. « Exporter la base » télécharge tout en .json : la version GitHub / hors ligne le reprend avec « Importer une base » (qui remplace sa base).</span> <button class="btn" id="expBase">Exporter la base</button>';
    lb.hidden = false;
    $('#expBase').onclick = async () => {
      const name = 'base-reglages-servo-' + new Date().toISOString().slice(0, 10) + '.json', txt = JSON.stringify(Object.fromEntries(KEYS.map(k => [k, S[k]])), null, 1);
      if (S.dl) { try { await S.dl.save({ filename: name, data: new TextEncoder().encode(txt) }); setStatus('Base enregistrée : ' + name); } catch (e) { if (!(e && e.code === 'declined')) setStatus('Export impossible.', true); } return; }
      const blob = new Blob([txt], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
  }
  KEYS.forEach(key => {
    db.collection(COLL[key]).onSnapshot(snap => { S[key] = snap.docs.map(d => ({ id: d.id, ...d.data() })); S.loaded[key] = true; onData(); },
      e => setStatus('Lecture de la base impossible (' + e.code + ').', true));
  });
})();
