import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, ScrollView, I18nManager, Platform, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import Header from '../../../components/common/Header';
import ArrowRightIcon from '../../../assets/icons/RightArrow';
import { useNavigation } from '@react-navigation/native';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';

const termsHtmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    /* Import Cairo font from system */
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap');
    
    /* Fallback font definitions */
    @font-face {
      font-family: 'Cairo';
      src: local('Cairo');
      font-weight: normal;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'Cairo';
      src: local('Cairo Bold');
      font-weight: bold;
      font-style: normal;
    }
    
    /* Force Cairo font on all elements with multiple selectors */
    html, body, div, h1, h2, h3, h4, h5, h6, p, span, a, li, ul, ol, strong, b, em, i, table, tr, td, th, article, main, section {
      font-family: 'Cairo', 'Arial', 'Helvetica', sans-serif !important;
    }
    
    /* Additional specific selectors */
    .ruls-article, .ruls-article *, .inside-main-page, .inside-main-page *, .container, .container * {
      font-family: 'Cairo', 'Arial', 'Helvetica', sans-serif !important;
    }
    
    body {
      direction: rtl;
      text-align: right;
      background-color: #fff;
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
      width: 100%;
      overflow-x: hidden;
    }
    
    .inside-main-page {
      align-items: start;
      width: 100%;
    }
    
    .container {
      width: 100%;
      overflow-x: hidden;
    }
    




@media screen and (max-width: 767px) {
    .ruls-article div {
        background-color: #fff;
        padding: 0px
    }
}


@media screen and (max-width: 767px) {
    .ruls-article h1 {
        font-size: 1.8rem;
    }
}

.ruls-article article {
    border-bottom: 1px solid rgba(0,0,0,.1)
}

    .ruls-article article h2 {
        font-weight: 700;
        font-size: 1.4rem;
        color: #23a2a4;
    }

    .ruls-article article p {
        font-size: 1rem;
        line-height: 34px;
        font-weight: 500;
        color: #666;
        text-align: justify
    }

    .ruls-article article ul li {
        padding: 8px;
        line-height: 34px;
        list-style: decimal
    }

    .ruls-article article b {
        color: #555
    }
  </style>
</head>
<body>
<main class="inside-main-page">
    <div class="container">
        <div class="inside-main-page__container ruls-article">
           <div>
     <h1>سياسة الالغاء والارجاع</h1>
     <article>
         <p>
             نحن في مركز د بسام الطبي نولي أهمية كبيرة لتقديم خدمات عالية
             الجودة لمرضانا الكرام في مجال الغسيل الكلوي المنزلي. تفضلوا
             بالإطلاع على سياسة الإلغاء والتي تتلخص بالنقاط التالية :
         </p>
     </article>

     <article>
         <h2>الإلغاء بدون سبب (عدم الحاجة للخدمة) :</h2>
         <p>
             في حالة إلغاء الخدمة بدون وجود سبب ورغبة العميل بالالغاء
             واسترداد المبلغ يتم خصم رسوم ادارية بقيمة 25 بالمية من قيمة
             الطلب شرط أن يكون الالغاء قبل بدء الخدمة.
         </p>
     </article>
     <article>
         <h2>الإلغاء بسبب شكوى أو ملاحظة على الخدمة المقدمة :</h2>
         <p>
             في حال وجود مشكلة في الخدمة المقدمة بشكل واضح فيحق للعميل طلب
             استرداد المبلغ المدفوع ويتم فتح شكوى بهذا الطلب للتأكد من
             المشكلة الحاصلة بالتحديد ويلزم من العميل تقديم ما يثبت ادعائه .
         </p>
     </article>
     <article>
         <h2>الغاء خدمات المرافق الصحي وغسيل الكلى المنزلي :</h2>
         <p>
             فيما يتعلق بخدمة غسيل الكلى المنزلي بشكل خاص وخدمات المرافقة
             الصحية على مختلف الباقات والعقود فإنه عند طلب الغاء الخدمة قبل
             بدئها يتم خصم نسبة 25 بالمية من كامل قيمة العقد. في حال طلب
             الغاء الخدمة بعد بدئها في أثناء سريان العقد فتحسب تكلفة عدد
             جلسات أو أيام تقديم الخدمة بالسعر والقيمة الأساسية لها. بالإضافة
             الى رسوم بقيمة 1000 ريال رسوم فك وازالة أجهوة فيما يتعلق بخدمة
             غسيل الكلى المنزلي
         </p>
     </article>
     <article>
         <h2>تنفيذ السياسة:</h2>
         <p>
             يجب على المريض الاتصال بفريق خدمة العملاء لدى الطرف الثاني في
             حالة الإلغاء، ويجب أن يتم ذلك بأقرب وقت ممكن. يُطبق السياسة على
             أي طلب إلغاء يتم تقديمه بعد تاريخ تركيب الأجهزة بمنزل المريض.
         </p>
     </article>
     <article>
         <h2>تأكيد الإلغاء:</h2>
         <p>
             يتعين على المريض تأكيد طلب الإلغاء بشكل رسمي عبر البريد
             الالكتروني للطرف الثاني ، مع تقديم أسباب الإلغاء إذا كان هناك
             سبب طبي يبرر الإلغاء.
         </p>
     </article>

     <article>
         <h2>مبلغ التأمين :</h2>
         <p>
             يسترد المريض من الطرف الثاني مبلغ تأمين الاجهزة بعد التأكد من
             استلام الاجهزة بحالتها الاساسية وبعد دفع تكاليف الالغاء الخاصة
             بالخدمة طبقا لما تم ذكره اعلاه،وفي حال وجود أى تلفيات أو مشاكل
             بالاجهزة فيتم ارسال تقرير فني بها مع التكاليف الخاصة بالصيانة
             وحجز مبلغ التأمين لحين انتهاء الصيانة وخصم المبالغ المستحقة.
         </p>
     </article>

     <article>
         <h2>وفي جميع الأحوال :</h2>
         <p>
             يتم تنفيذ السياسات السابقة في حالة ما اذا كان سبب الالغاء راجع
             لقصور او لسبب راجع لشكوى صحيحة وواقعية يتم نسبها الى المراكز اما
             في غير هذه الاحوال كعدول المريض على سبيل المثال لا الحصر عن
             الاستمرار واتمام المدة المتفق عليها لا يجوز له المطالبة بثمة
             مبالغ تم سدادها او أجزاء منها فيما عدا الحالة الاولى وهي عدم
             الشروع في بدء الخدمة كما هو موضح بعاليه
         </p>
     </article>
 </div>
        </div>
    </div>
</main>
</body>
</html>
`;

const PrivacyPolicy = () => {
    const navigation = useNavigation();
    const isRTL = I18nManager.isRTL;
    const windowWidth = Dimensions.get('window').width;

    const handleBack = () => {
        navigation.goBack();
    };

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text numberOfLines={1} style={[globalTextStyles.h5, styles.headerTitle]}>
                    سياسة الالغاء والارجاع
                </Text>
            }
            leftComponent={
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ArrowRightIcon />
                </TouchableOpacity>
            }
            containerStyle={styles.headerContainer}
        />
    );

    // Create a script to ensure Cairo font is applied and add debugging
    const injectScript = `
        (function() {
            console.log('Starting font application script...');
            
            // Function to apply Cairo font to all elements
            function applyCairoFont() {
                var allElements = document.querySelectorAll('*');
                var appliedCount = 0;
                
                for (var i = 0; i < allElements.length; i++) {
                    var element = allElements[i];
                    element.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                    appliedCount++;
                }
                
                console.log('Applied Cairo font to ' + appliedCount + ' elements');
                
                // Also try setting it on the document root
                document.documentElement.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                document.body.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                
                // Force font on specific important elements
                var importantElements = document.querySelectorAll('h1, h2, h3, p, li, div, span, article, main, section');
                for (var j = 0; j < importantElements.length; j++) {
                    importantElements[j].style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                }
            }
            
            // Apply font immediately
            applyCairoFont();
            
            // Apply font after a short delay to ensure DOM is ready
            setTimeout(applyCairoFont, 100);
            setTimeout(applyCairoFont, 500);
            setTimeout(applyCairoFont, 1000);
            
            // Apply font after fonts are loaded (if supported)
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function() {
                    console.log('Fonts loaded, applying Cairo font...');
                    applyCairoFont();
                });
            }
            
            // Apply font periodically to catch any new elements
            setInterval(applyCairoFont, 1000);
            
            // Listen for DOM changes and apply font to new elements
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                                if (node.style) {
                                    node.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                                }
                                var childElements = node.querySelectorAll('*');
                                for (var k = 0; k < childElements.length; k++) {
                                    childElements[k].style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                                }
                            }
                        });
                    }
                });
            });
            
            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            true; // Return true to indicate script execution
        })();
    `;

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.webViewContainer}>
                <WebView
                    source={{ html: termsHtmlContent }}
                    style={styles.webView}
                    originWhitelist={['*']}
                    scalesPageToFit={Platform.OS === 'android'}
                    showsVerticalScrollIndicator={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    textZoom={100}
                    startInLoadingState={true}
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={true}
                    bounces={false}
                    injectedJavaScript={injectScript}
                    onMessage={(event) => {
                        console.log('WebView message:', event.nativeEvent.data);
                    }}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error:', nativeEvent);
                    }}
                    onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView HTTP error:', nativeEvent);
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerTitle: {
        color: '#000',
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    webViewContainer: {
        flex: 1,
        marginTop: 1,
    },
    webView: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default PrivacyPolicy;
