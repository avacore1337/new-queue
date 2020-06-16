import React from 'react';
import { useSelector } from 'react-redux'
import { HashLink as Link } from 'react-router-hash-link';
import { GlobalStore } from '../../../store';
import User from '../../../models/User';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  return (
    user?.isAdministrator || user?.isTeacher || user?.isAssistant
      ? <div className="card p-3 mb-3">
          <h2 id="assistant">Assistants</h2>

          <p>
            Queue assistants help with moderating specific queues.
            In addition to removing specific users,
            they are also able to lock and <Link smooth to="/help#purge">purge</Link> queues, as well as sending messages and interact
            with the users in the queue.
          </p>
          <p>
            <em>
              Note: All the assistants privileges are located in the queue.
              You get there by choosing the right queue from the list of <Link smooth to="/list">queues</Link>.
            </em>
          </p>

          <h3 id="kick">Kicking a user</h3>
          <p>
            To remove a queue position, first double-click the user you wish to remove and thereafter click the appering red
            button with a cross on it.
            Be careful when removing users from the queue, as this action can not be reverted.
          </p>
          <p>
            <em>
              Note: If you are accessing the service through a recognized smartphone device, you will only have to click once
              to show the option to kick a user.
            </em>
          </p>

          <h3 id="message">Message a user</h3>
          <p>
            In order to send a message to a certain user in the queue, access the options as you would <Link smooth to="/help#kick">kicking</Link> a
            user, and click the blue button with an envelope on it.
            Enter a message in the window that opens up and click <em>Send</em>.
          </p>
          <p>
            To send a message to everyone in the queue, see <Link smooth to="/help#broadcast">broadcast</Link>.
          </p>

          <h3 id="help">Help a user</h3>
          <p>
            By helping a user, you mark them using the green button with a checkmark accessed in the same way as you would access the
            button to <Link smooth to="/help#kick">kick</Link> someone.
            When a user is receiving help, they will start pulsing, notifing any other assistant that they can move to the next person
            in the queue.
          </p>

          <h3 id="badLocation">Bad location</h3>
          <p>
            If an assistant is unable to find a given user because they have entered a location that is not precise enough, the
            assistant has the option to mark the user for <em>Bad location</em>.
            Marking a user for <em>bad location</em> is done by clicking the yellow button with a question-mark on it.
            The button is found at the same place as the one used to <Link smooth to="/help#kick">kick</Link> a user.
          </p>
          <p>
            The user will then receive a message prompting them to edit their location.
            The user will then have a red color until they have edited their location.
          </p>

          <h3 id="broadcast">Broadcast</h3>
          <p>
            If you want every user in the queue to know something you can user the ability to broadcast information.
          </p>
          <p id="assistantOptions">
            Below the option to <em>join the queue</em> assistants will find a dropdown with administrative options.
            The first one being <em>Broadcast</em>.
          </p>
          <p>
            Broadcasting is done by clicking the dropdown with administrative options and clicking <em>Broadcast</em>, this will
            open a window prompting the user to enter a message to broadcast.
            Once the message is entered, click the <em>Broadcast</em> button to send it.
          </p>
          <p>
            <em>
              Note: By using this function, everyone in the room will see the message.
              If you only want the assistants and teachers to see the message, use <Link smooth to="/help#broadcastFaculty">Broadcast faculty</Link>
              as described below.
            </em>
          </p>

          <h3 id="broadcastFaculty">Broadcast faculty</h3>
          <p>
            If you want every assistant and teacher in the given <em>room</em> you can user the ability to broadcast information to faculty.
          </p>
          <p>
            Broadcasting to faculty is done by clicking the <Link smooth to="/help#assistantOptions">dropdown</Link> with administrative options
            and clicking <em>Broadcast faculty</em>, this will open a window prompting the user to enter a message to broadcast.
            Once the message is entered, click the <em>Broadcast</em> button to send it.
          </p>
          <p>
            <em>
              Note: By using this function, only assistants and teachers can see the message.
              If you want everyone in the queue to see the message, use <Link smooth to="/help#broadcast">Broadcast</Link> as described above.
            </em>
          </p>

          <h3 id="purge">Purge a queue</h3>
          <p>
            When a queue is being purged, all people in the queue will be removed.
            Be careful though, as this action can not be reverted.
          </p>
          <p>
            To purge a queue, start off by clicking the <Link smooth to="/help#assistantOptions">dropdown</Link> with administrative options
            and then clicking the <em>Purge queue</em> button.
            Confirm in the popup that appears.
          </p>

          <h3 id="lock">Lock a queue</h3>
          <p>
            When a queue is locked, users can see the queue but not join it.
            When locking a queue, users already
            in the queue will <strong>not</strong> be removed.
          </p>
          <p>
            To lock a queue start off by clicking the <Link smooth to="/help#assistantOptions">dropdown</Link> with administrative options
            and clicking <em>Lock queue</em>.
            Confirm in the popup that appears.
          </p>
          <p>
            To unlock a queue, perform the same procedure as above, but instead of choosing <em>Lock</em>, you choose <em>Unlock</em>.
          </p>
        </div>
      : null
  );
};
