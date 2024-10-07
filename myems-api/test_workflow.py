import time
import hashlib
import requests
import config

workflow_base_url = config.myems_workflow['base_url']
token = config.myems_workflow['token']
app_name = config.myems_workflow['app_name']
user_name = config.myems_workflow['user_name']

timestamp = str(time.time())[:10]
ori_str = timestamp + token
signature = hashlib.md5(ori_str.encode(encoding='utf-8')).hexdigest()
headers = dict(signature=signature, timestamp=timestamp, appname=app_name, username=user_name)


def get_all_workflows():
    # get all flows
    get_data = dict()
    r = requests.get(workflow_base_url + 'workflows', headers=headers, params=get_data)
    result = r.json()
    print(result)


def get_workflow_init_state():
    # get workflow init state
    get_data = dict()
    r = requests.get(workflow_base_url + 'workflows/2/init_state', headers=headers, params=get_data)
    result = r.json()
    print(result)


def get_all_tickets():
    # get all tickets
    get_data = dict(per_page=20, category='all')
    r = requests.get(workflow_base_url + 'tickets', headers=headers, params=get_data)
    result = r.json()
    print(result)


def get_ticket_details(ticket_id):
    # get ticket details
    get_data = dict()
    r = requests.get(workflow_base_url + 'tickets/' + str(ticket_id), headers=headers, params=get_data)
    result = r.json()
    print(result)


def post_ticket():
    # post ticket
    data = dict(workflow_id=2, transition_id=7, target_username='admin', title='彭州服务区PCS报警')
    r = requests.post(workflow_base_url + 'tickets', headers=headers, json=data)
    result = r.json()
    print(result)


if __name__ == "__main__":
    # get_all_workflows()
    # get_workflow_init_state()
    get_all_tickets()
    # get_ticket_details(49)
    # post_ticket()
