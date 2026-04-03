from augurai import augur

def augur_service(product_info, product_diagram, prompts_file, max_tokens=4000):
    return augur(product_info, product_diagram, prompts_file, max_tokens)