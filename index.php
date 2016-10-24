<?php 
    echo 'hello world';
 ?>
 <!DOCTYPE html>
 <html>
 <head>
     <meta charset="utf-8">
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <title>TEI - Marketing Dashboard</title>
     <link href="https://fonts.googleapis.com/css?family=Roboto:100,400,700" rel="stylesheet">
     <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">


     <link rel="stylesheet" type="text/css" href="style/main.css">
 </head>
 <body>
 <header>
   <img src="https://logintei.staging.wpengine.com/wp-content/themes/tei-dashboard/assets/dashboard-assets/images/login-logo-inverse.svg" alt="tei-logo" class="header-tei-logo">
   <div class="header-text">
     MARKETING ANALYTICS
   </div>
 </header>

 <div class="container-fluid">
   <div class="row">
     <div class="col-md-12">
       <table class="channels-table table table-striped table-bordered  dash-element" id="channels">    
           <thead class="thead-inverse">
               <tr>
                   <th>Channel</th>
                   <th>Today <span>(sessions | conversions | rate) </span></th>
                   <th>This Week <div class="this-week-date-header"></div> <span>(sessions | conversions | rate) </span></th>
                   <th>Last Week <div class="last-week-date-header"></div> <span>(sessions | conversions | rate) </span></th>
                   <th>Last Month <span>(sessions | conversions | rate) </span></th>
               </tr>
           </thead>
           <tbody>

           </tbody>
       </table>
     </div>

   </div>
 </div>

 <div class="container-fluid">
     <div class="row">
         <div class="col-md-4">
             <div id="active-users-container" class="active-users-container dash-element"></div>
         </div>
         <div class="col-md-4">
         <div id="active-pages-container" class="dash-element">
         <h3 class="text-center dash-element-header">Top Active Pages</h3>
           <div class="list-group clearfix active-pages "></div>
         </div>

         </div>
         <div class="col-md-4">
             
             <div id="regions_div" style="width: 98%; height: 400px;border: 1px solid #ddd;"  class="dash-element"></div>

         </div>
     </div>
 </div>


 <div class="container">
     <div class="row text-center">
         <div class="col-md-12">
             <div id="embed-api-auth-container"></div>
         </div>
         <div class="col-md-6 hidden">
             <div id="view-selector-container"></div>
             <div id="view-name"></div>
         </div>
     </div>
 </div>


     

 <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
 <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
 <script>
 (function(w,d,s,g,js,fs){
   g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(f){this.q.push(f);}};
   js=d.createElement(s);fs=d.getElementsByTagName(s)[0];
   js.src='https://apis.google.com/js/platform.js';
   fs.parentNode.insertBefore(js,fs);js.onload=function(){g.load('analytics');};
 }(window,document,'script'));
 </script>

 <script type="text/javascript">

     </script>

 <!-- This demo uses the Chart.js graphing library and Moment.js to do date
      formatting and manipulation. -->
 <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js"></script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.2/moment.min.js"></script>
 <!-- <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.1.6/owl.carousel.min.js"></script> -->


 <!-- Include the ViewSelector2 component script. -->
 <script src="js/view-selector2.js"></script>

 <!-- Include the DateRangeSelector component script. -->
 <script src="js/date-range-selector.js"></script>

 <!-- Include the ActiveUsers component script. -->
 <script src="js/active-users.js"></script>




 <script src="min/main-min.js"></script>
 <script src="min/map-min.js"></script>
 </body>
 </html>