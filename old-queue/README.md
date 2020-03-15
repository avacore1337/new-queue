This is an active project dedicated to developing a queuesystem for computer labs at KTH. It is currently in somewhat of a beta status but since the previous systems (Sima and Qwait) failed very suddenly it is currently in quite heavy use since it's the only one that works. A wider release for the rest of KTH is intended for spring 2016.

Currenly running on queue.csc.kth.se as of September 2015.

Installation guide for testing:
First of, local installs will work badly since the KTH-login system won't work
unless your ip is on the whitelist and they won't just add you without a good reason. 

That being said, you can add a guest account as an admin by manipulating the
source-code or entering it in the database directly. There is a section in
app/model/queuesystem.js that has a setup part. If you uncomment setup and
comment out readin it will automatically fill the system with simulated data for you. 
The guest login screen is available at /#/login. The route is hard-coded to add "guest-" in front of the chosen name to make sure that it is safe.

The first thing that one needs to do is to install mongo and nodejs. After that
running npm install in the main folder should be all that is needed for the install. 
You might have to setup the accecs on the .npm folder depending on what distro you run.

To start the application just run "npm start" and then go to http://localhost:8080

