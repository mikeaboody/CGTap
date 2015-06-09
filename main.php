<!DOCTYPE html>
<html>
 <head>
  <title>CGTap</title>
  <style>
  #timer_button.highlight { 
    background-color: #00bfff;
  }  
  </style>
  
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
 </head>

 <script src="CGTap.js"></script>
 <body>
  <div class = "email_info" hidden><?php $email = htmlspecialchars($_POST['email']); echo $email;?></div>
 	<div class="wrapper">
      <h1>Tap App </h1>
      <h2 class="welcome">Loading user...</h2>
      <h3>Are you ready track some hours? What's your project?</h3>
    <div class = "projects">
      <select>
            <option value =""selected>Project</option>
      </select>
  		</div>
      <p>What's your task?</p>
      <div class = "tasks">
      <select>
            <option value =""selected>Task</option>
      </select>
  		</div>
      <p>Billing?</p>
      <div class="payment">
        <select>
          <option value =""selected>Billing</option>
        </select>
      </div>
      <p>Any notes?</p>
      <div class = "notes">
        <textarea rows="4" cols="50" placeholder="Enter some notes..."></textarea>
      </div>
      <p> Time your hours: </p>
      <div class = "timer">
        <button id = "timer_button">Time</button>
        <label>00:00:00</label>
      </div>
      <p> Or record them manually: </p>
        <form name="input">
			Hours: <input class = "hours" type="text" name="hours" placeholder="0" />
			<br/>
			Minutes: <input class = "minutes" type="text" name="minutes" placeholder="0" />
		</form>
		<br/>

		<label class="output"> </label>

      <br/>
      <br/>
      <button onclick="submit()">Submit</button>
    </div>
  
 </body>
</html>