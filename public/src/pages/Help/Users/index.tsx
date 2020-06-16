import React from 'react';
import { useSelector } from 'react-redux'
import { HashLink as Link } from 'react-router-hash-link';
import { GlobalStore } from '../../../store';
import User from '../../../models/User';
import Location from '../../../img/location.png';
import FindQueuesBox from '../../../img/find-queues-box.png';
import Allmanhand from '../../../img/allmanhand.png';
import { Lock, Star } from '../../../viewcomponents/FontAwesome';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  return (
    user
      ? <div ng-show="accessLevel >= 0" className="card p-3 mb-3">
          <h2 id="user">Users</h2>

          <h3 id="join">Join a queue</h3>
          <p>
            To join a queue, you will first need to find the queue (see <Link smooth to="/help#findAQueue">Find a queue</Link>).
            When you have found the queue, let's say you want to join the queue <em>Allmänhandledning</em>,
            click the queue name.
          </p>
          <img src={Allmanhand} alt="Allmänhandledning" />
          <p>
            You now reach the queue page, where all the queueing takes place.
            If you are at a KTH computer, your
            location will be automatically obtained.
          </p>
          <img src={Location} alt="Your location" />
          <p>
            If your location is not automatically obtained, please type your location in the location field.
          </p>
          <p>
            Now click the <em>Join queue</em> button, and you are done!
          </p>
          <p>
            <em>
              Note: On the queue list page, the queues you are currently queueing in become blue.
            </em>
          </p>

          <h3 id="leave">Leave a queue</h3>
          <p>
            To leave a queue, you must first join a queue.
            If you haven't joined the queue you want to leave,
            we recommend you to not join that queue.
            If you have already joined the queue you want to leave,
            go to the main page of the queue and click the <em>Leave queue</em> button.
          </p>

          <h3 id="receivingHelp">Receiving help</h3>
          <p>
            Once you have <Link smooth to="/help#join">joined</Link> a queue, you will notice that you are rewarded with a yellow
            button saying <em>Receiving help</em>, this button should be used if you are receiving help from an assistant
            who forgot to personally mark you as receiving help.
            If this is the case, click the button to prevent more assistants to come to you while you are receiving help.
          </p>

          <h3 id="colors">Colors</h3>
          <p>
            When a person is standing in the queue, they may have different colored backgrounds, here are their respective description.
          </p>
          <h4 id="whiteAndGray"><span style={{'backgroundColor': '#E3AF81', 'color': 'white'}}>White</span> and <span style={{'color': 'gray'}}>Gray</span></h4>
          <p>
            White and gray backgrounds indicates that the person is merely standing in the queue and the different colors are
            only used to make it easier to distinguish between the different rows.
          </p>
          <h4 id="blueStar" style={{'color': '#90C3D4'}}>Blue <Star color="blue" /></h4>
          <p>
            If a preson has a blue star next to their name, that means it is you.
          </p>
          <h4 id="pulsing"><span style={{'backgroundColor': '#E3AF81'}}>Pulsing</span></h4>
          <p>
            When you see a person that keeps pulsing, this indicates that they are currently receiving help from an assistant.
          </p>
          <p>
            <em>
              Note: We do realise that there is no specific color, don't be THAT person ...
            </em>
          </p>
          <h4 id="yellow" style={{'color': '#ECD024'}}>Yellow</h4>
          <p>
            If you see a person with a yellow background color, that means that the person was previously given a completion
            and has now come back to present their solution.
          </p>
          <h4 id="red" style={{'color': '#E54932'}}>Red</h4>
          <p>
            When a person has a red background color, that means that an assistant has told the person that they have to
            enter a more descriptive location so that the assistants can find the person.
          </p>

          <h3>Queue status</h3>
          <p>
            The queues in Stay A While can have different statuses, which can be good to know.
            The statuses are indicated by the color and style of the queue name.
          </p>
          <table className="table table-striped">
            <tbody><tr>
              <th>Style</th>
              <th>Icon</th>
              <th>Description</th>
            </tr>
            <tr>
              <td><strong>Active queue</strong></td>
              <td></td>
              <td>The queue is active and can be joined</td>
            </tr>
            <tr>
              <td className="text-red"><strong>Locked queue</strong></td>
              <td><Lock /></td>
              <td>The queue is locked and can't be joined</td>
            </tr>
          </tbody></table>

          <h3 id="findAQueue">Find a queue</h3>
          <p>
            The first step to queueing would be to find the queue you wish to join, right? So how is that done?
            Well, first go to the <Link smooth to="/list">Queues</Link> page.
            There you can either scroll to find the queue
            you are searching for, or you could search for the queue.
            To scroll, just scroll - more info on
            scrolling will not be covered in this help section.

            To search for a queue, type the queue name (or parts of the queue name) in the box that looks like this:
            <img src={FindQueuesBox} alt="Find Queues box" />
          </p>
        </div>
      : null
  );
};
