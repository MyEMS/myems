import uuid from 'uuid/v1';
import eventImg1 from '../../assets/img/generic/13.jpg';
import team15 from '../../assets/img/team/15.jpg';
import user1 from '../../assets/img/team/17.jpg';
import user4 from '../../assets/img/team/4.jpg';
import user13 from '../../assets/img/team/13.jpg';
import user10 from '../../assets/img/team/10.jpg';
import user8 from '../../assets/img/team/8.jpg';
import generic11 from '../../assets/img/generic/11.jpg';
import generic12 from '../../assets/img/generic/12.jpg';
import av4 from '../../assets/img/team/4.jpg';

export default [
  {
    id: uuid(),
    user: {
      name: 'Rowan Atkinson',
      avatarSrc: user4,
      time: '11 hrs',
      location: 'Consett, UK',
      privacy: 'friends',
      share: 'album',
      status: 'status-online'
    },
    content: {
      status:
        'Rowan Sebastian Atkinson CBE is an English actor, comedian and screenwriter best known for his work on the sitcoms Blackadder and Mr. Bean.',
      gallery: true
    },
    footer: {
      countLCS: {
        like: 345
      },
      comments: [
        {
          id: uuid(),
          avatarSrc: user4,
          name: 'Rowan Atkinson',
          content: `She starred as Jane Porter in The <a href="#!">@Legend of Tarzan (2016)</a>, Tanya Vanderpoel in for which nominated for a Teen Choice Award, and many other awards.`,
          postTime: '23hrs'
        },
        {
          id: uuid(),
          avatarSrc: user13,
          name: 'Jessalyn Gilsig',
          content:
            ' Jessalyn Sarah Gilsig is a Canadian-American actress known for her roles in television series, e.g., as Lauren Davis in Boston Public, Gina Russo in Nip/Tuck, Terri Schuester in Glee, and as Siggy Haraldson on the History Channel series Vikings. 🏆',
          postTime: '5hrs'
        }
      ],
      otherComments: '2 of 34'
    }
  },
  {
    id: uuid(),
    user: {
      name: 'Margot Robbie',
      avatarSrc: team15,
      time: '14Feb',
      location: 'London',
      privacy: 'friends',
      share: 'photo'
    },
    content: {
      status:
        "Margot Elise Robbie was born on July 2, 1990 in Dalby, Queensland, Australia to Scottish parents. Her mother, Sarie Kessler, is a physiotherapist, and her father, is Doug Robbie. She comes from a family of four children, having two brothers and one sister. She graduated from Somerset College in Mudgeeraba, Queensland, Australia, a suburb in the Gold Coast hinterland of South East Queensland, where she and her siblings were raised by their mother and spent much of her time at the farm belonging to her grandparents. In her late teens, she moved to Melbourne, Victoria, Australia to pursue an acting career.<br><br> From 2008-2010, Robbie played the character of Donna Freedman in the long-running Australian soap opera, Neighbours (1985), for which she was nominated for two Logie Awards. She set off to pursue Hollywood opportunities, quickly landing the role of Laura Cameron on the short-lived ABC series, Pan Am (2011). She made her big screen debut in the film, About Time (2013).<br><br> Robbie rose to fame co-starring alongside Leonardo DiCaprio, portraying the role of Naomi Lapaglia in Martin Scorsese's Oscar-nominated film, The Wolf of Wall Street (2013). She was nominated for a Breakthrough Performance MTV Movie Award, and numerous other awards."
    },
    footer: {
      countLCS: {
        like: 4,
        comment: '20 comments'
      },
      comments: [
        {
          id: uuid(),
          avatarSrc: av4,
          name: 'Rowan Atkinson',
          content:
            ' Jessalyn Sarah Gilsig is a Canadian-American actress known for her roles in television series, e.g., as Lauren Davis in Boston Public, Gina Russo in Nip/Tuck, Terri Schuester in Glee, and as Siggy Haraldson on the History Channel series Vikings. 🏆',
          postTime: '2min'
        }
      ]
    }
  },
  {
    id: uuid(),
    user: {
      name: 'Leonardo DiCaprio ',
      avatarSrc: user10,
      time: '13 jan',
      location: 'LA, US',
      privacy: 'public',
      share: 'photo'
    },
    content: {
      imgSrc: generic11
    },
    footer: {
      countLCS: {
        like: 3
      }
    }
  },
  {
    id: uuid(),
    content: {
      feedEvent: {
        title: "Free new year's eve midnight harbor",
        author: 'Boston harbor now',
        calender: {
          day: '31',
          month: 'Dec'
        },
        regFee: '$49.99 – $89.99',
        eventImg: eventImg1
      }
    },
    footer: {
      countLCS: {
        like: 130,
        share: 65
      },
      comments: [
        {
          id: uuid(),
          avatarSrc: generic11,
          name: 'Rowan Atkinson',
          content: `He starred as Jane Porter in The <a href="#!">@Legend of Tarzan (2016)</a>, Tanya Vanderpoel in for which nominated for a Teen Choice Award, and many other awards.`,
          postTime: '1hr'
        }
      ]
    }
  },
  {
    id: uuid(),
    user: {
      name: 'Johnny Depp',
      avatarSrc: user8,
      time: 'Just Now',
      location: 'Paris',
      privacy: 'friends',
      share: 'video',

      status: 'status-online'
    },
    content: {
      status:
        'See the sport of surfing as it’s never been captured before in John Florence and Blake Vincent Kueny’s second signature release, in association with the award-winning film studio, Brain Farm. The first surf film shot entirely in 4K, View From a Blue Moon. 🤩 🌎 🎬',
      video: {
        type: 'youtube',
        videoId: 'bTqVqk7FSmY'
      }
    },
    footer: {
      countLCS: {
        like: 0
      }
    }
  },
  {
    id: uuid(),
    user: {
      name: 'Emilia Clarke',
      avatarSrc: user1,
      time: '16 Dec',
      location: 'Bangladesh',
      privacy: 'public',
      status: 'status-online',
      share: 'url'
    },
    content: {
      url: {
        imgUrl: generic12,
        urlAddress: 'EN.WIKIPEDIA.ORG',
        title: "Mount Everest: Facts & Location of World's Highest Mountain",
        description:
          "The Himalayan range has many of the Earth's highest peaks, including the highest, Mount Everest..."
      }
    },
    footer: {
      countLCS: {
        like: 324
      }
    }
  }
];
