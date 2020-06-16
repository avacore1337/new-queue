import React from 'react';
import { useSelector } from 'react-redux'
import { HashLink as Link } from 'react-router-hash-link';
import { GlobalStore } from '../../../store';
import User from '../../../models/User';
import EditQueue from '../../../img/edit-queue.png';
import RemoveTeacher from '../../../img/remove-teacher.png';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  return (
    user?.isAdministrator || user?.isTeacher
      ? <div className="card p-3 mb-3">
          <h2 id="teacher">Teacher</h2>

          <p>
            Teachers are in charge of specific queues.
            In addition to the privileges of an assistant, they can also add and remove assistants as well
            as teachers from their queues
            and <Link smooth to="/help#hide">hide</Link> or <Link smooth to="/help#removeQueue">remove</Link> the queue itself.
          </p>

          <h3 id="addTeacherOrAssistant">Add a teacher or assistant</h3>
          <p>
            To add a teacher or assistant for a queue, go to the <Link smooth to="/administration">Administration</Link> page.
            Then choose the queue you wish to add a teacher or assistant for in the dropdown as below:
          </p>
          <img src={EditQueue} alt="Edit queue" />
          <p>
            Once you have selected a queue, enter the name of the user you wish to add either in the
            <em>Add teacher</em> or the <em>Add assistant</em> input fields, and click the <em>Add</em> button.
            If done correctly, the user should now show up in the list under the given input field.
          </p>

          <h3 id="removeTeacherOrAssistant">Remove a teacher or assistant</h3>
          <p>
            To remove a teacher or assistant from a queue, go to the <Link smooth to="/administration">Administration</Link> page.
            Choose the queue you wish to remove a teacher or assistant from in the dropdown, the way you would
            when <Link smooth to="/help#addTeacherOrAssistant">adding a teacher</Link>.
            Click the red cross beside the user you
            want to remove, as in the picture below.
          </p>
          <img src={RemoveTeacher} alt="Remove teacher" />
          <p>
            Once the name in the list is gone, so are their privileges.
          </p>

          <h3 id="hide">Hide a queue</h3>
          <p>
            Hiding a queue means both <Link smooth to="/help#purge">purging</Link> and hiding the queue.
            This can be used for example when there will be no labs in a queue for a longer time.
          </p>
          <p>
            To hide a queue, go to the <Link smooth to="/administration">Administration</Link> page.
            Then go into the <em>Select queue</em> dropdown as you would <Link smooth to="/help#addTeacherOrAssistant">adding
            a teacher or assistant</Link>, and click the <em>Hide queue</em> button that shows up upon selecting a queue.
            Confirm in the popup that appears.
          </p>
          <p>
            When you want to show the queue again, follow the same procedure and click the <em>Reveal queue</em> button
            which is now shown instead of the <em>Hide queue</em> button.
          </p>

          <h3 id="removeQueue">Removing a queue</h3>
          <p>
            Removing a queue means removing it from the system.
            There is no reversing this action and all privileges will be removed along with the queue.
          </p>
          <p>
            To remove a queue, go to the <Link smooth to="/administration">Administration</Link> page.
            Then go into the <em>Select queue</em> dropdown as you would <Link smooth to="/help#addTeacherOrAssistant">adding
            a teacher or assistant</Link>, and click the <em>Remove queue</em> button that shows up upon selecting a queue.
            Confirm in the popup that appears.
          </p>
          <p>
            <em>
              Note: If you wish to regain a removed queue, you will have to contact an administrator.
            </em>
          </p>

          <h3 id="statistics">Statistics</h3>
          <p>
            Stay A While allows the teacher to access some information about how a queue has been used.
          </p>
          <p>
            To access the statistics, first go to the <Link smooth to="/statistics">Statistics</Link> page.
            Then go into the <em>Select queue</em> dropdown, and select the desired queue.
            Then enter a starting point and an end point.
            Once the desired time-period has been entered click, the <em>Get statistics</em> button and the information
            should be shown below.
          </p>

          <h3 id="setMOTD">Set MOTD</h3>
          <p>
            MOTD stands for <em>Message Of The Day</em>.
            If you want users to know something once they enter the <em>room</em>, you can set an MOTD.
            The MOTD will be shown to every user once they enter the <em>room</em> and may i.e.
            be used to let them know that you only accept presentations today.
          </p>
          <p>
            The MOTD may be set by entering the queue page and clicking the <Link smooth to="/help#assistantOptions">dropdown</Link> with
            administrative options and clicking <em>Set MOTD</em>. This will open a
            window prompting the user to enter a message, as well as showing the current
            MOTD if there is one. Once the message is entered, click the <em>Set MOTD</em> button to save it.
          </p>
          <p>
            In order to remove the MOTD, follow the same procedure, but click <em>Remove MOTD</em> on the window that opens up.
          </p>
          <p>
            <em>
              Note: If you want the user to see the information for a longer amount of time,
              use <Link smooth to="/help#setInfo">Set queue info</Link> described below.
            </em>
          </p>

          <h3 id="setInfo">Set queue info</h3>
          <p>
            Information that you wish to show the user continuously should be entered as <em>queue info</em>.
            The queue info is shown on the top of the screen on the queue page if there is one,
            and can only be removed by a teacher.
          </p>
          <p>
            You set the <em>queue info</em> by clicking the <Link smooth to="/help#assistantOptions">dropdown</Link> with administrative options
            and clicking <em>Set queue info</em>, this will open a window prompting the user to enter some information.
            Once the message is entered, click the <em>Set info</em> button to save it.
          </p>
          <p>
            In order to remove the info, follow the same procedure, but click <em>Remove info</em> on the window that opens up.
          </p>
          <p>
            <em>
              Note: If you only want the user to see the info once, when they enter the <em>room</em>, try
              using <Link smooth to="/help#setMOTD">MOTD</Link> instead.
            </em>
          </p>
        </div>
      : null
  );
};
