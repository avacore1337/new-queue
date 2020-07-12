import React from 'react';
import { useSelector } from 'react-redux'
import { HashLink as Link } from 'react-router-hash-link';
import { GlobalStore } from '../../../store';
import User from '../../../models/User';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  return (
    user?.isAdministrator
      ? <div className="card p-3 mb-3">
          <h2 id="administrator">Administrators</h2>

          <p>
            Administrators are the supreme rulers of Stay A While, with privileges to perform just about anything.
            Their primary purpose is adding new queues, and adding teachers for those queues.
          </p>

          <h3 id="sendServerMessage">Set server-message</h3>
          <p>
            To add a server-message, go to the <Link smooth to="/administration">Administration</Link> page.
            Then click the <em>Set server-message</em> button and enter a message in the window that opens up.
            Once you have entered your message, click the <em>Set message</em> button to save your message.
            A server-message will then be shown to every user currently connected to <em>Stay A While</em> as
            well as those that connect while the message is active.
            A server-message may be useful to forewarn users upon updating the service.
          </p>
          <p>
            To remove a server-message, go to the <Link smooth to="/administration">Administration</Link> page.
            Then click the <em>Set server-message</em> button and then click the <em>Remove message</em> button
            on the window that opens up.
          </p>

          <h3 id="addAdmin">Add an administrator</h3>
          <p>
            To add an administrator, go to the <Link smooth to="/administration">Administration</Link> page.
            Then enter the username of the user you wish to add as administrator in the field which
            says <em>Add administrator</em> and click <em>Add</em>.
            If the entered username is correct, the user will immediately show up in the list of administrators
            below the input field.
          </p>
          <p>
            <em>
              Note: New administrators will get their privileges once they login next time, so they may have to
              log out and back in again.
            </em>
          </p>

          <h3 id="removeAdmin">Remove an administrator</h3>
          <p>
            To remove an administrator, go to the <Link smooth to="/administration">Administration</Link> page.
            Then, under <em>Administrators</em>, click the red cross next to the name of the administrator you wish to remove.
            The user should now disappear from the administrator list.
            If not, please refresh the page.
            The administrator rights will be removed from the user immediately.
          </p>
          <p>
            <em>
              Note: There must always be at least one administrator.
              It is therefore not possible to remove an administrator if it is the last one remaining.
            </em>
          </p>

          <h3 id="addQueue">Add a queue</h3>
          <p>
            To add a new queue, go to the <Link smooth to="/administration">Administration</Link> page.
            Then enter the name of the queue you wish to add in the field which says <em>Add queue</em> and click <em>Add</em>.
            The queue should now show up in the list of queues below the input field.
          </p>
          <p>
            To remove a queue, see <Link smooth to="/help#removeQueue">Remove queue</Link> under the <em>Teacher</em> section.
          </p>

          <h3>Add or remove teachers and assistants</h3>
          <p>
            See <Link smooth to="/help#addTeacherOrAssistant">
              Add a teacher or assistant
            </Link> and <Link smooth to="/help#removeTeacherOrAssistant">
              Remove a teacher or assistant
            </Link> under the <em>Teacher</em> section.
          </p>

          <h3>Accessing statistics</h3>
          <p>
            See <Link smooth to="/help#statistics">Statistics</Link> under the <em>Teacher</em> section
          </p>
        </div>
        : null
  );
};
