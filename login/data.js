/* login/data.js — local "database" for the form dropdowns and submissions.
 *
 * Loaded BEFORE login/api.js. When neither google.script.run nor AS_URL is
 * available, api.js reads from window.LOCAL_DATA below and stores form
 * submissions / nav buttons in localStorage.
 *
 * To change the dropdown options: edit the two arrays below and refresh the
 * page. The first employee in the list is the "pinned" default (the
 * Task Initiator dropdown will preselect them). */

window.LOCAL_DATA = {
  employees: [
    'Rahul Sharma',
    'Priya Mehta',
    'Amit Desai',
    'Sneha Joshi',
    'Vikram Nair',
    'Kavita Patel',
    'Rohan Verma',
    'Divya Singh'
  ],
  subjects: [
    'Fabrication',
    'Installation',
    'Maintenance',
    'Site Survey',
    'Procurement',
    'Project Management',
    'Quality Check',
    'Documentation'
  ],
  // Pre-existing rows the dashboard renders alongside any user submissions.
  // Edit/extend freely. Dates use YYYY-MM-DD.
  seedRows: [
    { timestamp:'2026-05-18', subject:'Fabrication',        client:'Client 1',  initiator:'Amit Desai',    doer:'Rahul Sharma',  task:'Task description for row 1',  priority:'1-Top Priority',    dueDate:'2026-05-18', status:'Done'         },
    { timestamp:'2026-05-17', subject:'Installation',       client:'Client 2',  initiator:'Sneha Joshi',   doer:'Priya Mehta',   task:'Task description for row 2',  priority:'2-Medium Priority', dueDate:'2026-05-15', status:'Approved'     },
    { timestamp:'2026-05-16', subject:'Maintenance',        client:'Client 3',  initiator:'Vikram Nair',   doer:'Amit Desai',    task:'Task description for row 3',  priority:'3-Low Priority',    dueDate:'2026-05-12', status:'Not Approved' },
    { timestamp:'2026-05-15', subject:'Site Survey',        client:'Client 4',  initiator:'Kavita Patel',  doer:'Sneha Joshi',   task:'Task description for row 4',  priority:'1-Top Priority',    dueDate:'2026-05-09', status:'Pending'      },
    { timestamp:'2026-05-14', subject:'Procurement',        client:'Client 5',  initiator:'Rohan Verma',   doer:'Vikram Nair',   task:'Task description for row 5',  priority:'2-Medium Priority', dueDate:'2026-05-06', status:'Not Started'  },
    { timestamp:'2026-05-13', subject:'Project Management', client:'Client 6',  initiator:'Divya Singh',   doer:'Kavita Patel',  task:'Task description for row 6',  priority:'3-Low Priority',    dueDate:'2026-05-03', status:'Initiated'    },
    { timestamp:'2026-05-12', subject:'Quality Check',      client:'Client 7',  initiator:'Rahul Sharma',  doer:'Rohan Verma',   task:'Task description for row 7',  priority:'1-Top Priority',    dueDate:'2026-04-30', status:'Follow Up 1'  },
    { timestamp:'2026-05-11', subject:'Documentation',      client:'Client 8',  initiator:'Priya Mehta',   doer:'Divya Singh',   task:'Task description for row 8',  priority:'2-Medium Priority', dueDate:'2026-04-27', status:'Cancelled'    },
    { timestamp:'2026-05-10', subject:'Fabrication',        client:'Client 9',  initiator:'Amit Desai',    doer:'Rahul Sharma',  task:'Task description for row 9',  priority:'3-Low Priority',    dueDate:'2026-04-24', status:'Transferred'  },
    { timestamp:'2026-05-09', subject:'Installation',       client:'Client 10', initiator:'Sneha Joshi',   doer:'Priya Mehta',   task:'Task description for row 10', priority:'1-Top Priority',    dueDate:'2026-04-21', status:'Need Help'    },
    { timestamp:'2026-05-08', subject:'Maintenance',        client:'Client 11', initiator:'Vikram Nair',   doer:'Amit Desai',    task:'Task description for row 11', priority:'2-Medium Priority', dueDate:'2026-04-18', status:'Done'         },
    { timestamp:'2026-05-07', subject:'Site Survey',        client:'Client 12', initiator:'Kavita Patel',  doer:'Sneha Joshi',   task:'Task description for row 12', priority:'3-Low Priority',    dueDate:'2026-04-15', status:'Approved'     },
    { timestamp:'2026-05-06', subject:'Procurement',        client:'Client 13', initiator:'Rohan Verma',   doer:'Vikram Nair',   task:'Task description for row 13', priority:'1-Top Priority',    dueDate:'2026-04-12', status:'Not Approved' },
    { timestamp:'2026-05-05', subject:'Project Management', client:'Client 14', initiator:'Divya Singh',   doer:'Kavita Patel',  task:'Task description for row 14', priority:'2-Medium Priority', dueDate:'2026-04-09', status:'Pending'      },
    { timestamp:'2026-05-04', subject:'Quality Check',      client:'Client 15', initiator:'Rahul Sharma',  doer:'Rohan Verma',   task:'Task description for row 15', priority:'3-Low Priority',    dueDate:'2026-04-06', status:'Not Started'  }
  ]
};
