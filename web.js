const express = require('express');
const fs = require('fs');
const app = express();
 
app.get('/', function (req, res) {
  res.send('Hello World!');
});

var con1 = require('./data.js');
var connection=con1.connecting();
var seq = 0;
/*app.get('/log', function(req, res){
        fs.appendFile('log.txt',JSON.stringify(req.query)+"\n", function(err){
                if(err) throw err
                console.log("%j",req.query)
                res.end("Got "+String(seq++) + " " + JSON.stringify(req.query))
        });
});

app.get('/push', function(req, res){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if(month < 10){
                month = "0" + month;
        }
        if(day < 10){
                day = "0" + day;
        }
        var today = year+""+month+""+day;
        var hour = date.getHours() + 9;
        var minutes = date.getMinutes();
        if(hour >= 24){
                hour = hour - 24;
        }
        if(hour < 10){
                hour = "0" + hour;
        }
        if(minutes < 10){
                minutes = "0" +minutes;
        }
        var time = hour+":"+minutes;
        var data = today+","+time+","+req.query.temp;

        fs.appendFile('temp_data.txt' ,data+"\n", function(err){
                if(err) throw err
                console.log(data);
                res.end("Got "+data);
        });
});*/
mysql= require('mysql');
/*var connection = mysql.createConnection({
        host: 'localhost',
        user: 'me',
        password: 'mypassword',
        database: 'mydb'
})*/
/*connection.connect();
function insert_sensor(device, unit, type, value, seq, ip) {
        obj= {};
        obj.seq= seq;
        obj.device= device;
        obj.unit= unit;
        obj.type= type;
        obj.value= value;
        obj.ip= ip.replace(/^.*:/, '')
        var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {
                if (err) throw err;
                console.log("database insertion ok= %j", obj);
        });
}*/

connection.connect();
function insert_sensor(temp, year, month, day, hour, minutes) {
        obj= {};
        obj.temp=temp;
        obj.year=year;
        obj.month=month;
        obj.day=day;
        obj.hour=hour;
        obj.minutes=minutes;
        var query = connection.query('insert into tempsense set ?', obj, function(err, rows, cols) {
                if (err) throw err;
                console.log("database insertion ok= %j", obj);
        });
}
app.get('/push', function(req, res){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if(month < 10){
                month = "0" + month;
        }
        if(day < 10){
                day = "0" + day;
        }
        var today = year+""+month+""+day;
        var hour = date.getHours() + 9;
        var minutes = date.getMinutes();
        if(hour >= 24){
                hour = hour - 24;
        }
        if(hour < 10){
                hour = "0" + hour;
        }
        if(minutes < 10){
                minutes = "0" +minutes;
        }
        var time = hour+":"+minutes;
        var data = today+","+time+","+req.query.temp;
	

	insert_sensor(parseFloat(req.query.temp),Number(year),Number(month),Number(day),Number(hour),Number(minutes));
        fs.appendFile('temp_data.txt' ,data+"\n", function(err){
                if(err) throw err
                console.log(data);
                res.end("Got "+data);
        });
});
app.get('/dump', function(req, res){
        var count = req.query.count;

        fs.readFile('temp_data.txt', function(err, data){
                if(err) throw err;
                var result ="";
                var start;
                var total_data = data.toString().split("\n");
                var len = total_data.length;
                if(len < count){
                        start = 0;
                }
                else{
                        start = len - count;
                }
                for(var i = start; i<len; i++){
                        result = result + total_data[i]+"\n";
                }
                res.end(result);
        });
});
app.get('/graph', function (req, res) {
        console.log('got app.get(graph)');
        var html = fs.readFile('./graph.html', function (err, html) {
                html = " "+ html
                console.log('read file');
                var qstr= 'select * from tempsense';
                connection.query(qstr, function(err, rows, cols) {
                        if (err) throw err;
                        var data = "";
                        var comma = ""
                        for (var i=0; i< rows.length; i++) {
                                r = rows[i];
                                data += comma + "[new Date("+r.year+","+r.month+"-1,"+ r.day +","+r.hour+","+r.minutes+"),"+ r.temp+"]";
                                comma = ",";
                        }
			var start_time = rows[0].year+"/"+rows[0].month+"/"+rows[0].day+" "+rows[0].hour+":"+rows[0].minutes
			var end_time = rows[i-1].year+"/"+rows[i-1].month+"/"+rows[i-1].day+" "+rows[i-1].hour+":"+rows[i-1].minutes
                        var header = "data.addColumn('date', 'Date / Time');"
                        header += "data.addColumn('number', 'Temperature');"
                        html = html.replace("<%HEADER%>", header);
                        html = html.replace("<%DATA%>", data);
			html = html.replace("<%STIME%>",start_time);
			html = html.replace("<%ETIME%>",end_time);
                        res.writeHeader(200, {"Content-Type": "text/html"});
                        res.write(html);
                        res.end();
                });
        });
})
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
